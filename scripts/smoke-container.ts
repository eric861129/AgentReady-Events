import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTAINER_SMOKE_CHECKS, containerNameFor } from "./container-smoke-plan";

interface ContainerSmokeOptions {
  image: string;
  port: number;
}

export interface ImageMetadata {
  os: string;
  architecture: string;
  revision: string;
}

interface DockerImageInspection {
  Id?: string;
  Os?: string;
  Architecture?: string;
  Config?: { Labels?: Record<string, string> };
}

export function parseContainerSmokeArgs(args: readonly string[]): ContainerSmokeOptions {
  let image = "";
  let port = 43130;

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const value = args[index + 1];
    if (current === "--image" && value) {
      image = value;
      index += 1;
    } else if (current === "--port" && value) {
      port = Number(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${current}`);
    }
  }

  if (!image) throw new Error("--image is required.");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("--port must be an integer in the range 1024–65535.");
  }
  return { image, port };
}

export function dockerRunArguments(name: string, port: number, image: string): string[] {
  return [
    "run",
    "--rm",
    "-d",
    "--name",
    name,
    "-e",
    "NODE_ENV=production",
    "-e",
    "PORT=3000",
    "-p",
    `127.0.0.1:${port}:3000`,
    image
  ];
}

export function validateImageMetadata(metadata: ImageMetadata, expectedRevision: string): void {
  if (metadata.os !== "linux" || metadata.architecture !== "amd64") {
    throw new Error(
      `Image platform must be linux/amd64, received ${metadata.os}/${metadata.architecture}.`
    );
  }
  if (metadata.revision !== expectedRevision) {
    throw new Error("Image OCI revision does not match the current Git commit.");
  }
}

function run(command: string, args: readonly string[]): string {
  return execFileSync(command, [...args], { encoding: "utf8", shell: false }).trim();
}

function inspectImage(image: string): DockerImageInspection {
  const inspections = JSON.parse(run("docker", ["image", "inspect", image])) as DockerImageInspection[];
  const inspection = inspections[0];
  if (inspections.length !== 1 || !inspection) {
    throw new Error(`Expected one Docker image inspection for ${image}.`);
  }
  return inspection;
}

function toMetadata(inspection: DockerImageInspection): ImageMetadata {
  return {
    os: inspection.Os ?? "",
    architecture: inspection.Architecture ?? "",
    revision: inspection.Config?.Labels?.["org.opencontainers.image.revision"] ?? ""
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function waitForHealth(url: string): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError = "no response";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(1_000);
  }
  throw new Error(`Container did not become healthy within 60 seconds: ${lastError}`);
}

export async function runContainerSmoke(
  options = parseContainerSmokeArgs(process.argv.slice(2))
): Promise<void> {
  const startedAt = new Date().toISOString();
  const commit = run("git", ["rev-parse", "HEAD"]);
  const containerName = containerNameFor(commit);
  const reportPath = resolve("evidence/latest/container-smoke.json");
  const checks: Array<Record<string, unknown>> = [];
  const report: Record<string, unknown> = {
    commit,
    imageRef: options.image,
    imageId: "",
    platform: "",
    containerName,
    port: options.port,
    startedAt,
    completedAt: "",
    checks,
    success: false
  };
  let started = false;
  let failure: unknown;

  try {
    const inspection = inspectImage(options.image);
    const metadata = toMetadata(inspection);
    validateImageMetadata(metadata, commit);
    report.imageId = inspection.Id ?? "";
    report.platform = `${metadata.os}/${metadata.architecture}`;

    run("docker", dockerRunArguments(containerName, options.port, options.image));
    started = true;
    const baseUrl = `http://127.0.0.1:${options.port}`;
    await waitForHealth(`${baseUrl}/health/live`);

    for (const check of CONTAINER_SMOKE_CHECKS) {
      const response = await fetch(`${baseUrl}${check.path}`);
      const body = await response.text();
      const passed = response.status === check.status && body.includes(check.contains);
      checks.push({ ...check, actualStatus: response.status, passed });
      if (!passed) throw new Error(`Container smoke check failed for ${check.path}.`);
    }
    report.success = true;
  } catch (error) {
    failure = error;
    report.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (started) {
      try {
        run("docker", ["stop", containerName]);
      } catch (cleanupError) {
        report.cleanupError = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        report.success = false;
        failure ??= cleanupError;
      }
    }
    report.completedAt = new Date().toISOString();
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (failure) throw failure;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runContainerSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

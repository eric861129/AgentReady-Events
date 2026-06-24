import { detectWebMcpSupport } from "./webmcp";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("找不到 #app 掛載點。");
}

const root = app;

render();

function render(): void {
  const route = window.location.hash === "#/diagnostics" ? "diagnostics" : "home";

  root.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#/" aria-label="AgentReady Events 首頁">
        <span class="brand-mark" aria-hidden="true">A</span>
        <span>AgentReady Events</span>
      </a>
      <nav class="site-nav" aria-label="主要導覽">
        <a href="#/" ${route === "home" ? "aria-current=\"page\"" : ""}>活動探索</a>
        <a href="#/diagnostics" ${route === "diagnostics" ? "aria-current=\"page\"" : ""}>WebMCP 狀態</a>
      </nav>
    </header>
    <main>
      ${route === "diagnostics" ? diagnosticsTemplate() : homeTemplate()}
    </main>
  `;

  window.addEventListener("hashchange", render, { once: true });
}

function homeTemplate(): string {
  return `
    <section class="hero">
      <div class="hero-copy">
        <h1>AgentReady Events</h1>
        <p>Day 6 先建立可啟動的活動網站骨架，並把 WebMCP feature detection 放進診斷頁，確認瀏覽器環境是否具備後續 Declarative Tool 所需的基礎能力。</p>
        <p class="hero-link"><a href="#/diagnostics">查看 WebMCP 狀態</a></p>
      </div>
      <figure class="hero-media">
        <img src="/assets/hero-events.png" alt="開發者活動會場與交流場景" />
      </figure>
    </section>
  `;
}

function diagnosticsTemplate(): string {
  const support = detectWebMcpSupport();

  return `
    <section class="diagnostics">
      <div class="section-heading">
        <h1>WebMCP 狀態</h1>
        <p>Day 6 只檢查執行環境，不註冊任何 Tool。這一頁會成為後續文章追蹤 WebMCP 能力變化的固定入口。</p>
      </div>
      <div class="diagnostics-grid">
        ${diagnosticCard("Secure Context", support.secureContext)}
        ${diagnosticCard("document.modelContext", support.documentModelContext)}
        ${diagnosticCard("registerTool()", support.registerTool)}
        ${diagnosticCard("getTools()", support.getTools)}
        ${diagnosticCard("executeTool()", support.executeTool)}
      </div>
    </section>
  `;
}

function diagnosticCard(label: string, enabled: boolean): string {
  return `
    <article class="diagnostic-card ${enabled ? "is-ok" : "is-muted"}">
      <span>${enabled ? "可用" : "未偵測"}</span>
      <h2>${label}</h2>
    </article>
  `;
}

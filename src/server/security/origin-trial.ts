const MAX_ORIGIN_TRIAL_TOKEN_LENGTH = 4096;
const TOKEN_CHARACTERS = /^[A-Za-z0-9+/_=.-]+$/;

export function originTrialHeader(token: string | undefined): string | undefined {
  if (token === undefined) return undefined;
  const trimmed = token.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_ORIGIN_TRIAL_TOKEN_LENGTH) {
    throw new Error("Origin Trial token must not exceed 4096 characters.");
  }
  if (!TOKEN_CHARACTERS.test(trimmed)) {
    throw new Error("Origin Trial token contains invalid characters.");
  }
  return trimmed;
}

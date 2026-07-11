import type { RegistrationInput, RegistrationResponse } from "../../shared/contracts";

type Field = { value: string };
export type RegistrationFields = { eventId: Field; attendeeName: Field; email: Field };

export function prepareRegistration(fields: RegistrationFields, input: RegistrationInput) {
  fields.eventId.value = input.eventId;
  fields.attendeeName.value = input.attendeeName;
  fields.email.value = input.email;
  return { ok: false as const, code: "CONFIRMATION_REQUIRED" as const, retryable: false, eventId: input.eventId };
}

export async function submitRegistration(
  post: (input: RegistrationInput, context: { mode: "human" | "agent" }) => Promise<RegistrationResponse>,
  input: RegistrationInput,
  context: { mode: "human" | "agent" }
) {
  if (context.mode !== "human") throw new Error("Registration requires visible human confirmation.");
  return post(input, context);
}

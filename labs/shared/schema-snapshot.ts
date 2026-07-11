export type FormFieldSnapshot = {
  name: string;
  control: string;
  required: boolean;
  description: string;
  values?: string[];
};

export function snapshotFormSchema(form: HTMLFormElement): FormFieldSnapshot[] {
  const snapshots: FormFieldSnapshot[] = [];
  for (const raw of Array.from(form.elements)) {
    const element = raw as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!element.name) continue;
    const tag = element.tagName.toLowerCase();
    if (tag !== "input" && tag !== "select" && tag !== "textarea") continue;
    const snapshot: FormFieldSnapshot = {
      name: element.name,
      control: tag === "input" ? `input:${(element as HTMLInputElement).type}` : tag,
      required: element.required,
      description: element.getAttribute("toolparamdescription") ?? ""
    };
    if (tag === "select") snapshot.values = Array.from((element as HTMLSelectElement).options).map((option) => option.value).filter(Boolean);
    snapshots.push(snapshot);
  }
  return snapshots;
}

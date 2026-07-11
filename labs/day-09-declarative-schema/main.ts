import { snapshotFormSchema } from "../shared/schema-snapshot";

const form = document.querySelector<HTMLFormElement>("#event-search");
const snapshot = document.querySelector<HTMLElement>("#snapshot");
if (form && snapshot) snapshot.textContent = JSON.stringify(snapshotFormSchema(form), null, 2);
form?.addEventListener("submit", (event) => event.preventDefault());

import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`AgentReady Events API listening on http://127.0.0.1:${port}`);
});


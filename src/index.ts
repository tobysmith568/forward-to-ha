import { ExpressAdapter } from "ask-sdk-express-adapter";
import express, { Response as ExResponse, Request } from "express";
import packageJson from "../package.json" with { type: "json" };
import { skill } from "./alexa.js";
import { env } from "./env.js";

const app = express();
const adapter = new ExpressAdapter(skill, false, false);
app.get("/", (_req: Request, res: ExResponse) => res.status(200).send("Welcome to forward-to-ha"));
app.get("/version", (_req: Request, res: ExResponse) =>
  res.status(200).send(packageJson.version ?? "unknown")
);
app.post("/alexa", adapter.getRequestHandlers());

const port = env.PORT;
app.listen(port, () => {
  console.log(`[server] Listening on port ${port}`);
});

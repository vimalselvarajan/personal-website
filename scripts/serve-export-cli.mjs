import { productionBasePath } from "../config/site.ts";
import { createExportServer } from "./serve-export.mjs";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65_535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

const server = createExportServer();
server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Static export server did not bind to a TCP port");
  console.log(`Static export: http://127.0.0.1:${address.port}${productionBasePath}/`);
});

// Luvina
// Vu Huy Hoang - Dev2
import "./config/env";
import app from "./app";
import config from "./config/env";

app.listen(config.port, config.host, () => {
  console.log(`Backend server listening on ${config.host}:${config.port}`);
});
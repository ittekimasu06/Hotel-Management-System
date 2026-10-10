import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`Hostay API đang chạy tại http://localhost:${config.port}`);
});

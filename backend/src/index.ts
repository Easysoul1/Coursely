import app from "./app";
import logger from "./lib/logger";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Coursely API running on http://localhost:${PORT}`);
});

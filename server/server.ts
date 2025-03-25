import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { ColorLogger as Logger } from "../utilities/colorLogger";
import MainDbModels from "./routes/mainDbModels";
import lootRoutes from "./routes/loot.routes";

// Load the OpenAPI spec (swagger.yaml)
const swaggerDocument = YAML.load("./api/openapi.yaml");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Swagger UI route
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1/loots', lootRoutes);

// Initialize database connection
const dbModels = MainDbModels.getInstance();

dbModels.openConnection().catch(error => {
  Logger.error('Failed to initialize database:', error);
  process.exit(1);
});

// Start server
app.listen(port, () => {
  Logger.info(`Server is running on port ${port}`);
  Logger.info(`Swagger UI available at http://localhost:${port}/swagger`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received. Closing database connection...');
  await dbModels.closeConnection();
  process.exit(0);
});

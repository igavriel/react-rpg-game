import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";
import { ILoot } from "../models/loot.model";
import { Loot } from "../../generated-server/api";

class LootController {
  private dbModels: MainDbModels;

  constructor() {
    Logger.debug(`LootController constructor`);
    this.dbModels = MainDbModels.getInstance();
    this.getLoots = this.getLoots.bind(this);
    this.getLoot = this.getLoot.bind(this);
  }

  async getLoots(req: Request, res: Response) {
    try {
      const loots: ILoot[] = await this.dbModels.lootDAL.getAll();

      if (!loots) {
        buildError(404, "Loots not found", res);
        return;
      }

      Logger.info(`LootController - Total Loots: ${loots.length}`);
      const retVal: Loot[] = [];
      for (const loot of loots) {
        const lootData = await this.dbModels.buildApiLoot(loot);
        retVal.push(lootData);
      }
      res.json(retVal);
    } catch (error) {
      Logger.error("LootController - Error getting loots:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async getLoot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loot: ILoot|null = await this.dbModels.lootDAL.getById(Number(id));

      if (!loot) {
        buildError(404, "Loot not found", res);
        return;
      }

      Logger.info(`LootController - Loot`, loot);
      const retVal: Loot = await this.dbModels.buildApiLoot(loot);
      res.json(retVal);
    } catch (error) {
      Logger.error("LootController - Error getting loot:", error);
      buildError(500, "Internal server error", res);
    }
  }
}

const router = Router();
const lootController = new LootController();

// Get all loots
router.get("/", lootController.getLoots as RequestHandler);
// Get specific loot by ID
router.get("/:id", lootController.getLoot as RequestHandler);

export default router;

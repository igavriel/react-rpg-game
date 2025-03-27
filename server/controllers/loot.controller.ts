import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from '../../utilities/colorLogger';
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";

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
      const loots = await this.dbModels.lootDAL.getAll();

      if (!loots) {
        buildError(404, 'Loots not found', res);
        return;
      }

      Logger.debug(`Total Loots: ${loots.length}`);
      res.json(loots);
    } catch (error) {
      Logger.error('Error getting loots:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async getLoot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loot = await this.dbModels.lootDAL.getById(Number(id));

      if (!loot) {
        buildError(404, 'Loot not found', res);
        return;
      }

      Logger.debug(`Loot`, loot);
      res.json(loot);
    } catch (error) {
      Logger.error('Error getting loot:', error);
      buildError(500, 'Internal server error', res);
    }
  }
}

const router = Router();
const lootController = new LootController();

// Get all loots
router.get('/', lootController.getLoots as RequestHandler);
// Get specific loot by ID
router.get('/:id', lootController.getLoot as RequestHandler);

export default router;

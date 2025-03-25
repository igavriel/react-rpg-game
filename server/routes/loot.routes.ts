import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from '../../utilities/colorLogger';
import MainDbModels from "./mainDbModels";

class LootController {
  private dbModels: MainDbModels;

  constructor() {
    this.dbModels = MainDbModels.getInstance();
    this.getLoots = this.getLoots.bind(this);
    this.getLoot = this.getLoot.bind(this);
  }

  async getLoot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loot = await this.dbModels.lootDAL.getById(Number(id));

      if (!loot) {
        res.status(404).json({ message: 'Loot not found' });
        return;
      }

      res.json(loot);
    } catch (error) {
      Logger.error('Error getting loot:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLoots(req: Request, res: Response) {
    try {
      const loots = await this.dbModels.lootDAL.getAll();

      if (!loots) {
        res.status(404).json({ message: 'Loots not found' });
        return;
      }

      res.json(loots);
    } catch (error) {
      Logger.error('Error getting loots:', error);
      res.status(500).json({ message: 'Internal server error' });
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

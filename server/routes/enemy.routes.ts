import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from '../../utilities/colorLogger';
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";

class EnemyController {
  private dbModels: MainDbModels;

  constructor() {
    this.dbModels = MainDbModels.getInstance();
    this.getEnemies = this.getEnemies.bind(this);
  }

  async getEnemies(req: Request, res: Response) {
    try {
      const enemies = await this.dbModels.enemyDAL.getAllEnemies();
      res.json(enemies);
    } catch (error) {
      Logger.error('Error getting enemies:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async getEnemy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enemy = await this.dbModels.enemyDAL.getEnemyById(Number(id));

      if (!enemy) {
        buildError(404, 'Enemy not found', res);
        return;
      }

      res.json(enemy);
    } catch (error) {
      Logger.error('Error getting enemy:', error);
      buildError(500, 'Internal server error', res);
    }
  }
}

const router = Router();
const enemyController = new EnemyController();

// Get all enemies
router.get('/', enemyController.getEnemies as RequestHandler);
// Get specific enemy by ID
router.get('/:id', enemyController.getEnemy as RequestHandler);

export default router;

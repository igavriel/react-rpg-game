import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import MainDbModels from "../controllers/mainDbModels";
import buildError from "../../utilities/buildError";
import { IEnemy } from "../models/enemy.model";
import { Enemy } from "../../generated-server/api";

class EnemyController {
  private dbModels: MainDbModels;

  constructor() {
    Logger.debug(`EnemyController constructor`);
    this.dbModels = MainDbModels.getInstance();
    this.getEnemies = this.getEnemies.bind(this);
    this.getEnemy = this.getEnemy.bind(this);
  }

  async getEnemies(req: Request, res: Response) {
    try {
      const enemies: IEnemy[] = await this.dbModels.enemyDAL.getAllEnemies();
      Logger.info(`EnemyController - Total enemies: ${enemies.length}`);

      const retVal: Enemy[] = [];
      for (const enemy of enemies) {
        const enemyData = await this.dbModels.buildApiEnemy(enemy);
        retVal.push(enemyData);
      }

      res.json(retVal);
    } catch (error) {
      Logger.error("EnemyController - Error getting enemies:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async getEnemy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enemy: IEnemy|null = await this.dbModels.enemyDAL.getEnemyById(Number(id));
      if (!enemy) {
        buildError(404, "Enemy not found", res);
        return;
      }

      Logger.info(`EnemyController - Enemy`, enemy);
      const retVal = await this.dbModels.buildApiEnemy(enemy);
      res.json(retVal);
    } catch (error) {
      Logger.error("EnemyController - Error getting enemy:", error);
      buildError(500, "Internal server error", res);
    }
  }
}

const router = Router();
const enemyController = new EnemyController();

// Get all enemies
router.get("/", enemyController.getEnemies as RequestHandler);
// Get specific enemy by ID
router.get("/:id", enemyController.getEnemy as RequestHandler);

export default router;

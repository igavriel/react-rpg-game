import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";
import { IGame } from "../models/game.model";
import { Game, Enemy } from "../../generated-server/api";
import { IGameEnemy } from "../models/gameEnemy.model";

class GameController {
  private dbModels: MainDbModels;

  constructor() {
    this.dbModels = MainDbModels.getInstance();
    this.getGames = this.getGames.bind(this);
    this.getTopGames = this.getTopGames.bind(this);
    this.createGame = this.createGame.bind(this);
    this.getGame = this.getGame.bind(this);
    this.deleteGame = this.deleteGame.bind(this);
    this.addEnemyToGame = this.addEnemyToGame.bind(this);
    this.removeEnemyFromGame = this.removeEnemyFromGame.bind(this);
    this.removeLootFromGame = this.removeLootFromGame.bind(this);

    // this.getCurrentEnemy = this.getCurrentEnemy.bind(this);
    // this.defendAttack = this.defendAttack.bind(this);
    // this.escapeBattle = this.escapeBattle.bind(this);
    // this.endGame = this.endGame.bind(this);
    // this.getGameLoot = this.getGameLoot.bind(this);
  }

  async getGames(req: Request, res: Response) {
    try {
      const games: IGame[] = await this.dbModels.gameDAL.getAllGames();
      if (!games) {
        buildError(404, "Games not found", res);
        return;
      }
      // Convert the games to the API format
      let retVal: Game[] = [];
      for (const game of games) {
        let gameObj: Game = await this.dbModels.buildApiGame(game);
        retVal.push(gameObj);
      }
      res.json(retVal);
    } catch (error) {
      Logger.error("GameController - Error getting games:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async getTopGames(req: Request, res: Response) {
    try {
      const games: IGame[] = await this.dbModels.gameDAL.getTopGames();
      if (!games) {
        buildError(404, "Games not found", res);
        return;
      }

      // Convert the games to the API format
      let retVal: Game[] = [];
      for (const game of games) {
        let gameObj: Game = await this.dbModels.buildApiGame(game);
        retVal.push(gameObj);
      }
      res.json(retVal);
    } catch (error) {
      Logger.error("GameController - Error getting top games:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async createGame(req: Request, res: Response) {
    try {
      const playerId: number = req.body.player_id;
      const enemies: number = req.body.enemies;
      Logger.info(
        `GameController - Creating game for player ${playerId} with ${enemies} enemies`
      );

      const game: IGame = await this.dbModels.generateGame(Number(playerId), Number(enemies));

      // Convert the game to the API format
      const retVal: Game = await this.dbModels.buildApiGame(game);
      res.status(201).json(retVal);
    } catch (error) {
      Logger.error("GameController - Error creating game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async getGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const game: IGame|null = await this.dbModels.gameDAL.getGameById(Number(id));
      if (!game) {
        buildError(404, "Game not found", res);
        return;
      }

      // Convert the game to the API format
      const retVal: Game = await this.dbModels.buildApiGame(game);
      res.json(retVal);
    } catch (error) {
      Logger.error("GameController - Error getting Game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async deleteGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isDelete: boolean = await this.dbModels.gameDAL.deleteGame(
        Number(id)
      );

      Logger.info(`GameController - Deleted game with ID ${id} - ${isDelete}`);
      res.status(204).send();
    } catch (error) {
      Logger.error("GameController - Error deleting game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async addEnemyToGame(req: Request, res: Response) {
    try {
      const { id, enemyId } = req.params;
      const gameEnemy: IGameEnemy = await this.dbModels.gameDAL.addEnemyToGame(
        Number(id),
        Number(enemyId)
      );

      const retVal: Enemy = await this.dbModels.buildApiGameEnemy(gameEnemy);
      res.json(retVal);
    } catch (error) {
      Logger.error("GameController - Error adding enemy to game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async removeEnemyFromGame(req: Request, res: Response) {
    try {
      const { id, enemyId } = req.params;
      const isDelete: boolean = await this.dbModels.gameDAL.removeEnemyFromGame(
        Number(id),
        Number(enemyId)
      );

      Logger.info(
        `GameController - Deleted enemy ${enemyId} from game ${id} - ${isDelete}`
      );
      res.status(204).send();
    } catch (error) {
      Logger.error("GameController - Error removing enemy from game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async removeLootFromGame(req: Request, res: Response) {
    try {
      const { id, lootId } = req.params;
      const isDelete: boolean = await this.dbModels.gameDAL.removeLootFromGame(
        Number(id),
        Number(lootId)
      );

      Logger.info(
        `GameController - Deleted loot ${lootId} from game ${id} - ${isDelete}`
      );
      res.status(204).send();
    } catch (error) {
      Logger.error("GameController - Error removing loot from game:", error);
      buildError(500, "Internal server error", res);
    }
  }

  // async attackEnemy(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const game = await this.dbModels.gameDAL.attackEnemy(Number(id), req.body.enemyId);
  //     res.json(game);
  //   } catch (error) {
  //     Logger.error('GameController - Error attacking enemy:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }

  // async defendAttack(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const game = await this.dbModels.gameDAL.defendAttack(Number(id), req.body.enemyId);
  //     res.json(game);
  //   } catch (error) {
  //     Logger.error('GameController - Error defending:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }

  // async escapeBattle(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const game = await this.dbModels.gameDAL.escapeBattle(Number(id), req.body.enemyId);
  //     res.json(game);
  //   } catch (error) {
  //     Logger.error('GameController - Error escaping:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }

  // async endGame(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const game = await this.dbModels.gameDAL.endGame(Number(id), req.body.enemyId);
  //     res.json(game);
  //   } catch (error) {
  //     Logger.error('GameController - Error ending game:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }

  // async getCurrentEnemy(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const enemy = await this.dbModels.gameDAL.getEnemy(Number(id), req.body.enemyId);
  //     res.json(enemy);
  //   } catch (error) {
  //     Logger.error('GameController - Error getting current enemy:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }

  // async getGameLoot(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const loot = await this.dbModels.gameDAL.getLoot(Number(id), req.body.lootId);
  //     res.json(loot);
  //   } catch (error) {
  //     Logger.error('GameController - Error getting game loot:', error);
  //     buildError(500, 'Internal server error', res);
  //   }
  // }
}

const router = Router();
const gameController = new GameController();

// Get all Games
router.get("/", gameController.getGames as RequestHandler);
// Get top games
router.get("/top", gameController.getTopGames as RequestHandler);
// Create a new Game
router.post("/new", gameController.createGame as RequestHandler);
// Get specific Game by ID
router.get("/:id", gameController.getGame as RequestHandler);
// Delete a Game
router.delete("/:id", gameController.deleteGame as RequestHandler);
// Add an enemy to a game
router.post("/:id/enemy", gameController.getGame as RequestHandler);
// Remove an enemy from a game
router.delete(
  "/:id/enemy/:enemyId",
  gameController.removeEnemyFromGame as RequestHandler
);
// Remove loot from a game
router.delete(
  "/:id/loot/:lootId",
  gameController.removeLootFromGame as RequestHandler
);

// // Get Current enemy for a game
// router.get('/:id/enemy', gameController.getCurrentEnemy as RequestHandler);
// // Attack an enemy
// router.post('/:id/attack', gameController.attackEnemy as RequestHandler);
// // Defend against an enemy
// router.post('/:id/defend', gameController.defendAttack as RequestHandler);
// // Escape from an enemy
// router.post('/:id/escape', gameController.escapeBattle as RequestHandler);
// // End a game
// router.post('/:id/end', gameController.endGame as RequestHandler);
// // Get loot from a game
// router.get('/:id/loot', gameController.getGameLoot as RequestHandler);

export default router;


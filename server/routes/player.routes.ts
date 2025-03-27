import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from '../../utilities/colorLogger';
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";

class PlayerController {
  private dbModels: MainDbModels;

  constructor() {
    this.dbModels = MainDbModels.getInstance();
    this.getPlayers = this.getPlayers.bind(this);
  }

  async getPlayers(req: Request, res: Response) {
    try {
      const players = await this.dbModels.playerDAL.getAllPlayers();
      res.json(players);
    } catch (error) {
      Logger.error('Error getting players:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async getPlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const player = await this.dbModels.playerDAL.getPlayerById(Number(id));

        if (!player) {
          buildError(404, 'Player not found', res);
          return;
        }

      res.json(player);
    } catch (error) {
      Logger.error('Error getting player:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async createPlayer(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const player = await this.dbModels.playerDAL.createPlayer(name);
      res.status(201).json(player);
    } catch (error) {
      Logger.error('Error creating player:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async deletePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.dbModels.playerDAL.deletePlayer(Number(id));
      res.status(204).send();
    } catch (error) {
      Logger.error('Error deleting player:', error);
      buildError(500, 'Internal server error', res);
    }
  }
}

const router = Router();
const playerController = new PlayerController();

// Get all players
router.get('/', playerController.getPlayers as RequestHandler);
// Get specific player by ID
router.get('/:id', playerController.getPlayer as RequestHandler);

export default router;

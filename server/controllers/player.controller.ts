import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from '../../utilities/colorLogger';
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";
import { PlayerGenerator } from "../../utilities/playerGenerator";

class PlayerController {
  private dbModels: MainDbModels;

  constructor() {
    Logger.debug(`PlayerController constructor`);
    this.dbModels = MainDbModels.getInstance();
    this.getPlayers = this.getPlayers.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.createPlayer = this.createPlayer.bind(this);
    this.deletePlayer = this.deletePlayer.bind(this);
  }

  async getPlayers(req: Request, res: Response) {
    try {
      const players = await this.dbModels.playerDAL.getAllPlayers();

      Logger.debug(`Total Players: ${players.length}`);
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

        Logger.debug(`Player: ${player}`);
        res.json(player);
    } catch (error) {
      Logger.error('Error getting player:', error);
      buildError(500, 'Internal server error', res);
    }
  }

  async createPlayer(req: Request, res: Response) {
    try {
      const { name } = req.body;

      let generator = new PlayerGenerator();
      let playerEntry = generator.generatePlayer();

      let nameTrimmed = name.trim();
      if (nameTrimmed != null) {
        playerEntry.name = nameTrimmed;
      }
      let playerEntryJson = JSON.parse(JSON.stringify(playerEntry));
      delete playerEntryJson.id;
      const player = await this.dbModels.playerDAL.createPlayer(playerEntryJson);

      Logger.info(`Created player:`, player);
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

      Logger.debug(`Deleted player with ID: ${id}`);
      res.status(200).send();
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
// Delete a player by ID
router.delete('/:id', playerController.deletePlayer as RequestHandler);
// Create a new player
router.post('/new', playerController.createPlayer as RequestHandler);

export default router;

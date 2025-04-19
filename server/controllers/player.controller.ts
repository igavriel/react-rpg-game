import { Router, Request, Response, RequestHandler } from "express";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import MainDbModels from "./mainDbModels";
import buildError from "../../utilities/buildError";
import { IPlayer } from "../models/player.model";
import { Player } from "../../generated-server/api";

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
      const players: IPlayer[] = await this.dbModels.playerDAL.getAllPlayers();
      Logger.info(`PlayerController - Total Players: ${players.length}`);

      const retVal: Player[] = [];
      for (const player of players) {
        const playerData = await this.dbModels.buildApiPlayer(player);
        retVal.push(playerData);
      }
      res.json(retVal);
    } catch (error) {
      Logger.error("PlayerController - Error getting players:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async getPlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const player: IPlayer|null = await this.dbModels.playerDAL.getPlayerById(
        Number(id)
      );
      if (!player) {
        buildError(404, "Player not found", res);
        return;
      }

      Logger.info("PlayerController - Player:", player);

      const retVal: Player = await this.dbModels.buildApiPlayer(player);
      res.json(retVal);
    } catch (error) {
      Logger.error("PlayerController - Error getting player:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async createPlayer(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const player: IPlayer = await this.dbModels.generatePlayer(name);

      Logger.info(`PlayerController - Created player:`, player);

      const retVal: Player = await this.dbModels.buildApiPlayer(player);
      res.status(201).json(retVal);
    } catch (error) {
      Logger.error("PlayerController - Error creating player:", error);
      buildError(500, "Internal server error", res);
    }
  }

  async deletePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isDelete: boolean = await this.dbModels.playerDAL.deletePlayer(
        Number(id)
      );

      Logger.info(`PlayerController - Deleted player with ID: ${id} - ${isDelete}`);
      res.status(204).send();
    } catch (error) {
      Logger.error("PlayerController - Error deleting player:", error);
      buildError(500, "Internal server error", res);
    }
  }
}

const router = Router();
const playerController = new PlayerController();

// Get all players
router.get("/", playerController.getPlayers as RequestHandler);
// Get specific player by ID
router.get("/:id", playerController.getPlayer as RequestHandler);
// Delete a player by ID
router.delete("/:id", playerController.deletePlayer as RequestHandler);
// Create a new player
router.post("/new", playerController.createPlayer as RequestHandler);

export default router;

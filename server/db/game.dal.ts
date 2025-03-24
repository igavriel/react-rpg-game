///////////////////////////////////////////////////////////////////////////////
// GameDAL is a class that provides data access layer operations for games
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { IGame, GameDbModel } from "../models/game.model";
import { Op } from "sequelize";

export class GameDAL {
  private dbModel: typeof GameDbModel;

  constructor(dbModel: typeof GameDbModel) {
    this.dbModel = dbModel;
  }

  // Create a new game
  async createGame(game: Omit<IGame, 'id'>): Promise<IGame> {
    try {
      const newGame = await this.dbModel.create(game);
      return newGame.toJSON();
    } catch (error) {
      Logger.error(`Failed to create game: ${error}`);
      throw error;
    }
  }

  // Read a game by ID
  async getGameById(id: number): Promise<IGame | null> {
    try {
      const game = await this.dbModel.findByPk(id);
      return game?.toJSON() || null;
    } catch (error) {
      Logger.error(`Failed to get game by id ${id}: ${error}`);
      throw error;
    }
  }

  // Read all games
  async getAllGames(): Promise<IGame[]> {
    try {
      const games = await this.dbModel.findAll();
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`Failed to get all games: ${error}`);
      throw error;
    }
  }

  // Update a game
  async updateGame(id: number, game: Partial<IGame>): Promise<IGame | null> {
    try {
      const [updated] = await this.dbModel.update(game, {
        where: { id },
        returning: true
      });
      if (updated) {
        const updatedGame = await this.dbModel.findByPk(id);
        return updatedGame?.toJSON() || null;
      }
      return null;
    } catch (error) {
      Logger.error(`Failed to update game ${id}: ${error}`);
      throw error;
    }
  }

  // Delete a game
  async deleteGame(id: number): Promise<boolean> {
    try {
      const deleted = await this.dbModel.destroy({
        where: { id }
      });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to delete game ${id}: ${error}`);
      throw error;
    }
  }

  // Get games by player ID
  async getGamesByPlayerId(playerId: number): Promise<IGame[]> {
    try {
      const games = await this.dbModel.findAll({
        where: { playerId }
      });
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`Failed to get games for player ${playerId}: ${error}`);
      throw error;
    }
  }

  // Get top games by score
  async getTopGames(limit: number = 10): Promise<IGame[]> {
    try {
      const games = await this.dbModel.findAll({
        order: [['score', 'DESC']],
        limit
      });
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`Failed to get top ${limit} games: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
import baseDatabase from "./baseDatabase";
import { characterSequelize } from "../models/character.model";
import { playerSequelize } from "../models/player.model";
import { gameSequelize } from "../models/game.model";
import { PlayerDAL } from "./player.dal";

async function example() {
  const characterDb = characterSequelize(baseDatabase);
  const playerDb = playerSequelize(baseDatabase, characterDb);
  const gameDb = gameSequelize(baseDatabase, playerDb);

  const gameDAL = new GameDAL(gameDb);
  const playerDAL = new PlayerDAL(characterDb, playerDb);

  // Authenticate and sync database
  await baseDatabase.authenticate();
  await baseDatabase.sync({ force: false }); // Create tables if not exists
  Logger.info('Database connection established');

  const players = await playerDAL.getAllPlayers();
  if (players.length === 0) {
    Logger.error('No players found');
    return;
  }
  const player = players[0];
  const gameEntry = { playerId: player.id, score: 100, date: new Date() }

  // Create a new game
  const game = await gameDAL.createGame(gameEntry);
  Logger.info('Created game:', game);

  // Get game by ID
  const gameById = await gameDAL.getGameById(game.id);
  Logger.info('Got game by id:', gameById);

  // Get all games
  const allGames = await gameDAL.getAllGames();
  Logger.info('All games:', allGames);

  // Get games by player ID
  const playerGames = await gameDAL.getGamesByPlayerId(1);
  Logger.info('Games for player 1:', playerGames);

  // Get top games
  const topGames = await gameDAL.getTopGames(5);
  Logger.info('Top 5 games:', topGames);
}
example();

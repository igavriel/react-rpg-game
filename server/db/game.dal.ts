///////////////////////////////////////////////////////////////////////////////
// GameDAL is a class that provides data access layer operations for games
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { IGame, GameDbModel } from "../models/game.model";
import { IGameEnemy, GameEnemyDbModel } from "../models/gameEnemy.model";
import { IGameLoot, GameLootDbModel } from "../models/gameLoot.model";
import { Op } from "sequelize";

export class GameDAL {
  private gameModel: typeof GameDbModel;
  private gameEnemyModel: typeof GameEnemyDbModel;
  private gameLootModel: typeof GameLootDbModel;

  constructor(
    gameModel: typeof GameDbModel,
    gameEnemyModel: typeof GameEnemyDbModel,
    gameLootModel: typeof GameLootDbModel
  ) {
    this.gameModel = gameModel;
    this.gameEnemyModel = gameEnemyModel;
    this.gameLootModel = gameLootModel;
  }

  // Create a new game
  async createGame(game: Omit<IGame, 'id'>): Promise<IGame> {
    try {
      const newGame = await this.gameModel.create(game);
      return newGame.toJSON();
    } catch (error) {
      Logger.error(`Failed to create game: ${error}`);
      throw error;
    }
  }

  // Read a game by ID
  async getGameById(id: number): Promise<IGame | null> {
    try {
      const game = await this.gameModel.findByPk(id);
      return game?.toJSON() || null;
    } catch (error) {
      Logger.error(`Failed to get game by id ${id}: ${error}`);
      throw error;
    }
  }

  // Read all games
  async getAllGames(): Promise<IGame[]> {
    try {
      const games = await this.gameModel.findAll();
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`Failed to get all games: ${error}`);
      throw error;
    }
  }

  // Update a game
  async updateGame(id: number, game: Partial<IGame>): Promise<IGame | null> {
    try {
      const [updated] = await this.gameModel.update(game, {
        where: { id },
        returning: true
      });
      if (updated) {
        const updatedGame = await this.gameModel.findByPk(id);
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
      const deleted = await this.gameModel.destroy({
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
      const games = await this.gameModel.findAll({
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
      const games = await this.gameModel.findAll({
        order: [['score', 'DESC']],
        limit
      });
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`Failed to get top ${limit} games: ${error}`);
      throw error;
    }
  }

  // Game-Enemy relationship methods
  async addEnemyToGame(gameId: number, enemyId: number): Promise<IGameEnemy> {
    try {
      const gameEnemy = await this.gameEnemyModel.create({ gameId, enemyId });
      return gameEnemy.toJSON();
    } catch (error) {
      Logger.error(`Failed to add enemy ${enemyId} to game ${gameId}: ${error}`);
      throw error;
    }
  }

  async getEnemiesForGame(gameId: number): Promise<IGameEnemy[]> {
    try {
      const gameEnemies = await this.gameEnemyModel.findAll({
        where: { gameId }
      });
      return gameEnemies.map(ge => ge.toJSON());
    } catch (error) {
      Logger.error(`Failed to get enemies for game ${gameId}: ${error}`);
      throw error;
    }
  }

  async removeEnemyFromGame(gameId: number, enemyId: number): Promise<boolean> {
    try {
      const deleted = await this.gameEnemyModel.destroy({
        where: { gameId, enemyId }
      });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to remove enemy ${enemyId} from game ${gameId}: ${error}`);
      throw error;
    }
  }

  // Game-Loot relationship methods
  async addLootToGame(gameId: number, lootId: number): Promise<IGameLoot> {
    try {
      const gameLoot = await this.gameLootModel.create({ gameId, lootId });
      return gameLoot.toJSON();
    } catch (error) {
      Logger.error(`Failed to add loot ${lootId} to game ${gameId}: ${error}`);
      throw error;
    }
  }

  async getLootForGame(gameId: number): Promise<IGameLoot[]> {
    try {
      const gameLoot = await this.gameLootModel.findAll({
        where: { gameId }
      });
      return gameLoot.map(gl => gl.toJSON());
    } catch (error) {
      Logger.error(`Failed to get loot for game ${gameId}: ${error}`);
      throw error;
    }
  }

  async removeLootFromGame(gameId: number, lootId: number): Promise<boolean> {
    try {
      const deleted = await this.gameLootModel.destroy({
        where: { gameId, lootId }
      });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to remove loot ${lootId} from game ${gameId}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { characterSequelize } from "../models/character.model";
// import { playerSequelize } from "../models/player.model";
// import { gameSequelize } from "../models/game.model";
// import { enemySequelize } from "../models/enemy.model";
// import { lootSequelize } from "../models/loot.model";
// import { gameEnemySequelize } from "../models/gameEnemy.model";
// import { gameLootSequelize } from "../models/gameLoot.model";
// import { PlayerDAL } from "./player.dal";
// import { EnemyDAL } from "./enemy.dal";
// import { LootDAL } from "./loot.dal";

// async function example() {
//   const lootDb = lootSequelize(baseDatabase);
//   const characterDb = characterSequelize(baseDatabase);
//   const playerDb = playerSequelize(baseDatabase, characterDb);
//   const enemyDb = enemySequelize(baseDatabase, characterDb, lootDb);
//   const gameDb = gameSequelize(baseDatabase, playerDb);
//   const gameEnemyDb = gameEnemySequelize(baseDatabase, gameDb, enemyDb);
//   const gameLootDb = gameLootSequelize(baseDatabase, gameDb, lootDb);

//   const lootDAL = new LootDAL(lootDb);
//   const playerDAL = new PlayerDAL(characterDb, playerDb);
//   const enemyDAL = new EnemyDAL(characterDb, enemyDb);
//   const gameDAL = new GameDAL(gameDb, gameEnemyDb, gameLootDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');

//   const players = await playerDAL.getAllPlayers();
//   if (players.length === 0) {
//     Logger.error('No players found');
//     return;
//   }
//   const players1 = await playerDAL.getAllPlayers();
//   if (players1.length === 0) {
//     Logger.error('No players found');
//     return;
//   }
//   const player = players[0];
//   const gameEntry = { playerId: player.id, score: 100, date: new Date() }

//   // Create a new game
//   const game = await gameDAL.createGame(gameEntry);
//   Logger.info('Created game:', game);

//   const enemies = await enemyDAL.getAllEnemies();
//   if (enemies.length === 0) {
//     Logger.error('No enemies found');
//     return;
//   }
//   const enemy = enemies[0];

//   // Add enemy to game
//   const gameEnemy = await gameDAL.addEnemyToGame(game.id, enemy.id);
//   Logger.info('Added enemy to game:', gameEnemy);

//   const loot = await lootDAL.getAll();
//   if (loot.length === 0) {
//     Logger.error('No loot found');
//     return;
//   }
//   const lootItem = loot[0];

//   // Add loot to game
//   const gameLoot = await gameDAL.addLootToGame(game.id, lootItem.id);
//   Logger.info('Added loot to game:', gameLoot);

//   // Get enemies for game
//   const gameEnemies = await gameDAL.getEnemiesForGame(game.id);
//   Logger.info('Enemies for game:', gameEnemies);

//   // Get loot for game
//   const gameLootItems = await gameDAL.getLootForGame(game.id);
//   Logger.info('Loot for game:', gameLootItems);

//   // Remove enemy from game
//   const enemyRemoved = await gameDAL.removeEnemyFromGame(game.id, 1);
//   Logger.info('Removed enemy from game:', enemyRemoved);

//   // Remove loot from game
//   const lootRemoved = await gameDAL.removeLootFromGame(game.id, 1);
//   Logger.info('Removed loot from game:', lootRemoved);

//   // Get game by ID
//   const gameById = await gameDAL.getGameById(game.id);
//   Logger.info('Got game by id:', gameById);

//   // Get all games
//   const allGames = await gameDAL.getAllGames();
//   Logger.info('All games:', allGames);

//   // Get games by player ID
//   const playerGames = await gameDAL.getGamesByPlayerId(1);
//   Logger.info('Games for player 1:', playerGames);

//   // Get top games
//   const topGames = await gameDAL.getTopGames(5);
//   Logger.info('Top 5 games:', topGames);
// }
// example();

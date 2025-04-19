import baseDatabase from "../db/baseDatabase";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { LootDbModel, lootSequelize } from "../models/loot.model";
import {
  CharacterDbModel,
  characterSequelize,
} from "../models/character.model";
import { PlayerDbModel, playerSequelize } from "../models/player.model";
import { EnemyDbModel, enemySequelize } from "../models/enemy.model";
import { GameDbModel, gameSequelize } from "../models/game.model";
import {
  GameEnemyDbModel,
  gameEnemySequelize,
} from "../models/gameEnemy.model";
import { GameLootDbModel, gameLootSequelize } from "../models/gameLoot.model";

import { LootDAL } from "../db/loot.dal";
import { PlayerDAL } from "../db/player.dal";
import { EnemyDAL } from "../db/enemy.dal";
import { GameDAL } from "../db/game.dal";

import { RandomGenerator } from "../../utilities/randomGenerator";
import { PlayerGenerator } from "../../utilities/playerGenerator";
import { MonsterGenerator } from "../../utilities/monsterGenerator";
import { LootGenerator } from "../../utilities/lootGenerator";

import { ILoot } from "../models/loot.model";
import { IPlayer } from "../models/player.model";
import { IEnemy } from "../models/enemy.model";
import { IGame } from "../models/game.model";
import { IGameEnemy } from "../models/gameEnemy.model";
import { IGameLoot } from "../models/gameLoot.model";

import {
  convertLoot,
  convertEnemy,
  convertGame,
  convertPlayer,
} from "../../utilities/convert";
import {
  Loot,
  Player,
  Enemy,
  Game,
} from "../../generated-server/api";

class MainDbModels {
  private static instance: MainDbModels;

  private lootDb: typeof LootDbModel;
  private characterDb: typeof CharacterDbModel;
  private playerDb: typeof PlayerDbModel;
  private enemyDb: typeof EnemyDbModel;
  private gameDb: typeof GameDbModel;
  private gameEnemyDb: typeof GameEnemyDbModel;
  private gameLootDb: typeof GameLootDbModel;

  public lootDAL: LootDAL;
  public playerDAL: PlayerDAL;
  public enemyDAL: EnemyDAL;
  public gameDAL: GameDAL;

  private constructor() {
    this.lootDb = lootSequelize(baseDatabase);
    this.characterDb = characterSequelize(baseDatabase);
    this.playerDb = playerSequelize(baseDatabase, this.characterDb);
    this.enemyDb = enemySequelize(baseDatabase, this.characterDb, this.lootDb);
    this.gameDb = gameSequelize(baseDatabase, this.playerDb);
    this.gameEnemyDb = gameEnemySequelize(
      baseDatabase,
      this.gameDb,
      this.enemyDb
    );
    this.gameLootDb = gameLootSequelize(baseDatabase, this.gameDb, this.lootDb);

    this.lootDAL = new LootDAL(this.lootDb);
    this.playerDAL = new PlayerDAL(this.characterDb, this.playerDb);
    this.enemyDAL = new EnemyDAL(this.characterDb, this.enemyDb);
    this.gameDAL = new GameDAL(this.gameDb, this.gameEnemyDb, this.gameLootDb);
  }

  public static getInstance(): MainDbModels {
    if (!MainDbModels.instance) {
      Logger.info("MainDbModels - Creating new MainDbModels instance");
      MainDbModels.instance = new MainDbModels();
    }
    return MainDbModels.instance;
  }

  async openConnection() {
    try {
      // Authenticate and sync database
      await baseDatabase.authenticate();
      await baseDatabase.sync({ force: false }); // Create tables if not exists
      Logger.info("MainDbModels - Database connection established");
    } catch (error) {
      Logger.error("MainDbModels - Database connection failed:", error);
    }
  }

  async closeConnection() {
    try {
      await baseDatabase.close();
      Logger.info("MainDbModels - Database connection closed");
    } catch (error) {
      Logger.error("MainDbModels - Database connection close failed:", error);
    }
  }

  async generatePlayer(name: string | null): Promise<IPlayer> {
    const dbModels = MainDbModels.getInstance();

    let playerGenerator = new PlayerGenerator();
    let playerEntry = playerGenerator.generatePlayer();

    let nameTrimmed = typeof name === "string" ? name.trim() : null;
    if (nameTrimmed != null) {
      playerEntry.name = nameTrimmed;
    }
    // Delete the 'id' field before creating the db object to prevent a SequelizeUniqueConstraintError
    let playerEntryJson = JSON.parse(JSON.stringify(playerEntry));
    delete playerEntryJson.id;
    const player = await dbModels.playerDAL.createPlayer(
      playerEntryJson
    );
    return player;
  }

  async generateGame(playerId: number, enemies: number): Promise<IGame> {
    const dbModels = MainDbModels.getInstance();

    const game = await dbModels.gameDAL.createGame(playerId);
    if (!game) {
      throw new Error("Game not created");
    }

    let monsterGenerator = new MonsterGenerator();
    let lootGenerator = new LootGenerator();
    let randomGenerator = new RandomGenerator();
    for (let i = 0; i < enemies; i++) {
      const randomLoot = lootGenerator.generateLoot(
        randomGenerator.getRandomInteger(1, 10)
      );
      // Delete the 'id' field before creating the db object to prevent a SequelizeUniqueConstraintError
      let randomLootJson = JSON.parse(JSON.stringify(randomLoot));
      delete randomLootJson.id;
      const loot = await dbModels.lootDAL.create(randomLootJson);

      const randomEnemy = monsterGenerator.generateMonster(loot.id);
      let randomEnemyJson = JSON.parse(JSON.stringify(randomEnemy));
      delete randomEnemyJson.id;
      const monster = await dbModels.enemyDAL.createEnemy(
        randomEnemyJson
      );

      await dbModels.gameDAL.addEnemyToGame(game.id, monster.id);
      Logger.debug(
        `generateGame: Enemy[${i}] - Created loot ${loot.id} and monster ${monster.id} for game ${game.id}`
      );
    }
    return game;
  }

  async buildApiLoot(loot: ILoot): Promise<Loot> {
    const retVal: Loot = convertLoot(loot);
    return retVal;
  }

  async buildApiPlayer(player: IPlayer): Promise<Player> {
    const retVal: Player = convertPlayer(player);
    return retVal;
  }

  async buildApiEnemy(enemy: IEnemy): Promise<Enemy> {
    const dbModels = MainDbModels.getInstance();
    const lootObj = await dbModels.lootDAL.getById(enemy.lootId);
    if (!lootObj) {
      Logger.error(`buildEnemy - Loot not found: ${enemy.lootId}`);
      throw "Loot not found";
    }
    const loot: ILoot = lootObj as ILoot;
    const retVal: Enemy = convertEnemy(enemy, loot);
    return retVal;
  }

  async buildApliGameLoot(gameLoot: IGameLoot): Promise<Loot> {
    const dbModels = MainDbModels.getInstance();
    const loot = await dbModels.lootDAL.getById(gameLoot.lootId);
    if (!loot) {
      Logger.error(`buildGameLoot - Loot not found: ${gameLoot.lootId}`);
      throw "Loot not found";
    }
    const retVal: Loot = await dbModels.buildApiLoot(loot);
    return retVal;
  }

  async buildApiGameEnemy(gameEnemy: IGameEnemy): Promise<Enemy> {
    const dbModels = MainDbModels.getInstance();
    const enemy = await dbModels.enemyDAL.getEnemyById(gameEnemy.enemyId);
    if (!enemy) {
      Logger.warn(`buildGameEnemy - Enemy not found: ${gameEnemy.enemyId}`);
      throw "Enemy not found";
    }

    const loot = await dbModels.lootDAL.getById(enemy.lootId);
    if (!loot) {
      Logger.error(`buildGameEnemy - Loot not found: ${enemy.lootId}`);
      throw "Loot not found";
    }
    const retVal: Enemy = convertEnemy(enemy, loot);
    return retVal;
  }

  async buildApiGame(game: IGame): Promise<Game> {
    const dbModels = MainDbModels.getInstance();
    const playerObject = await dbModels.playerDAL.getPlayerById(game.playerId);
    if (!playerObject) {
      Logger.error(`buildApiGame - Player not found: ${game.playerId}`);
      throw "Player not found";
    }
    const player: IPlayer = playerObject as IPlayer;
    const gameEnemies = await dbModels.gameDAL.getEnemiesForGame(game.id);
    let enemies: IEnemy[] = [];
    for (const ge of gameEnemies) {
      const enemy = await dbModels.enemyDAL.getEnemyById(ge.enemyId);
      if (!enemy) {
        Logger.error(`GameController - Enemy not found: ${ge.enemyId}`);
        throw "Enemy not found";
      }
      enemies.push(enemy);
    }

    let enemiesLoots: ILoot[] = [];
    for (const enemy of enemies) {
      const loot = await dbModels.lootDAL.getById(enemy.lootId);
      if (!loot) {
        Logger.error(`GameController - Loot not found: ${enemy.lootId}`);
        throw "Loot not found";
      }
      enemiesLoots.push(loot);
    }

    let gameLoots: ILoot[] = [];
    const gameLootsRecords = await dbModels.gameDAL.getLootForGame(game.id);
    for (const gl of gameLootsRecords) {
      const loot = await dbModels.lootDAL.getById(gl.lootId);
      if (!loot) {
        Logger.error(`GameController - Loot not found: ${gl.lootId}`);
        throw "Loot not found";
      }
      gameLoots.push(loot);
    }
    const retVal: Game = convertGame(
      game,
      player,
      enemies,
      enemiesLoots,
      gameLoots
    );
    return retVal;
  }
}

export default MainDbModels;

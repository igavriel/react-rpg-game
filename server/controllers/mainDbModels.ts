import baseDatabase from "../db/baseDatabase";
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { LootDbModel, lootSequelize } from "../models/loot.model";
import { CharacterDbModel, characterSequelize } from "../models/character.model";
import { PlayerDbModel, playerSequelize } from "../models/player.model";
import { EnemyDbModel, enemySequelize } from "../models/enemy.model";
import { GameDbModel, gameSequelize } from "../models/game.model";
import { GameEnemyDbModel, gameEnemySequelize } from "../models/gameEnemy.model";
import { GameLootDbModel, gameLootSequelize } from "../models/gameLoot.model";

import { LootDAL } from "../db/loot.dal";
import { PlayerDAL } from "../db/player.dal";
import { EnemyDAL } from "../db/enemy.dal";
import { GameDAL } from "../db/game.dal";

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
    this.gameEnemyDb = gameEnemySequelize(baseDatabase, this.gameDb, this.enemyDb);
    this.gameLootDb = gameLootSequelize(baseDatabase, this.gameDb, this.lootDb);

    this.lootDAL = new LootDAL(this.lootDb);
    this.playerDAL = new PlayerDAL(this.characterDb, this.playerDb);
    this.enemyDAL = new EnemyDAL(this.characterDb, this.enemyDb);
    this.gameDAL = new GameDAL(this.gameDb, this.gameEnemyDb, this.gameLootDb);
  }

  public static getInstance(): MainDbModels {
    if (!MainDbModels.instance) {
      Logger.info('Creating new MainDbModels instance');
      MainDbModels.instance = new MainDbModels();
    }
    return MainDbModels.instance;
  }

  async openConnection() {
    try {
      // Authenticate and sync database
      await baseDatabase.authenticate();
      await baseDatabase.sync({ force: false }); // Create tables if not exists
      Logger.info('Database connection established');
    } catch (error) {
      Logger.error('Database connection failed:', error);
    }
  }

  async closeConnection() {
    try {
      await baseDatabase.close();
      Logger.info('Database connection closed');
    } catch (error) {
      Logger.error('Database connection close failed:', error);
    }
  }
}

export default MainDbModels;

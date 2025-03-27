///////////////////////////////////////////////////////////////////////////////
// EnemyDAL is a class that provides data access layer operations for enemies
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { IEnemy, EnemyDbModel } from "../models/enemy.model";
import { CharacterDbModel } from "../models/character.model";
import { CharacterDAL } from "./character.dal";

export class EnemyDAL extends CharacterDAL {
  private enemyModel: typeof EnemyDbModel;

  constructor(characterModel: typeof CharacterDbModel, enemyModel: typeof EnemyDbModel) {
    super(characterModel);
    this.enemyModel = enemyModel;
  }

  // Create a new enemy
  async createEnemy(enemy: Omit<IEnemy, 'id'>): Promise<IEnemy> {
    try {
      // First create the character part
      const newCharacter = await this.createCharacter(enemy);

      // Then create the enemy part with the loot reference
      const newEnemy = await this.enemyModel.create({
        id: newCharacter.id,
        lootId: enemy.lootId
      });

      return {
        ...newCharacter,
        lootId: newEnemy.lootId
      };
    } catch (error) {
      Logger.error(`Failed to create enemy with loot: ${error}`);
      throw error;
    }
  }

  // Get enemy by ID
  async getEnemyById(id: number): Promise<IEnemy | null> {
    try {
      const enemy = await this.enemyModel.findByPk(id);
      if (!enemy) {
        Logger.error(`Enemy with id ${id} not found`);
        return null;
      }

      const character = await this.getCharacterById(id);
      if (!character) {
        Logger.error(`Character with id ${id} not found`);
        return null;
      }

      return {
        ...character,
        lootId: enemy.lootId
      };
    } catch (error) {
      Logger.error(`Failed to get enemy by id ${id} with loot: ${error}`);
      throw error;
    }
  }

  // Get all enemies
  async getAllEnemies(): Promise<IEnemy[]> {
    try {
      const enemies = await this.enemyModel.findAll();
      const characters = await this.getAllCharacters();

      return enemies.map(enemy => {
        const character = characters.find(c => c.id === enemy.id);
        if (!character) {
          Logger.error(`Character with id ${enemy.id} not found`);
          return null;
        }

        return {
          ...character,
          lootId: enemy.lootId
        };
      }).filter((enemy): enemy is IEnemy => enemy !== null);
    } catch (error) {
      Logger.error(`Failed to get all enemies with loot: ${error}`);
      throw error;
    }
  }

  // Get enemies by loot ID
  async getEnemiesByLootId(lootId: number): Promise<IEnemy[]> {
    try {
      const enemies = await this.enemyModel.findAll({
        where: { lootId }
      });

      const characters = await this.getAllCharacters();
      return enemies.map(enemy => {
        const character = characters.find(c => c.id === enemy.id);
        if (!character) {
          Logger.error(`Character with id ${enemy.id} not found`);
          return null;
        }

        return {
          ...character,
          lootId: enemy.lootId
        };
      }).filter((enemy): enemy is IEnemy => enemy !== null);
    } catch (error) {
      Logger.error(`Failed to get enemies by loot id ${lootId}: ${error}`);
      throw error;
    }
  }

  // Update enemy's loot
  async updateEnemyLoot(id: number, lootId: number): Promise<boolean> {
    try {
      const [updated] = await this.enemyModel.update(
        { lootId },
        { where: { id } }
      );
      return updated > 0;
    } catch (error) {
      Logger.error(`Failed to update enemy ${id} loot: ${error}`);
      throw error;
    }
  }

  // Delete enemy
  async deleteEnemy(id: number): Promise<boolean> {
    try {
      const deleted = await this.enemyModel.destroy({ where: { id } });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to delete enemy ${id}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { enemySequelize } from "../models/enemy.model";
// import { lootSequelize } from "../models/loot.model";
// import { characterSequelize } from "../models/character.model";
// import { LootDAL } from "./loot.dal";

// async function example() {
//   const lootDb = lootSequelize(baseDatabase);
//   const characterDb = characterSequelize(baseDatabase);
//   const enemyDb = enemySequelize(baseDatabase, characterDb, lootDb);
//   const enemyDAL = new EnemyDAL(characterDb, enemyDb);
//   const lootDAL = new LootDAL(lootDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');

//   const loot = await lootDAL.create({ name: "Dragon Loot", value: 100 });
//   Logger.info('Created loot:', loot);

//   // Create a new enemy with loot
//   const enemy = await enemyDAL.createEnemy(
//     { name: "Dragon", health: 200, attackPower: 20, luck: 0.3, level: 5, lootId: loot.id }
//   );
//   Logger.info('Created enemy:', enemy);

//   // Get enemy with loot information
//   const enemyWithLoot = await enemyDAL.getEnemyById(enemy.id);
//   Logger.info('Got enemy with loot:', enemyWithLoot);

//   // Get all enemies with loot
//   const allEnemies = await enemyDAL.getAllEnemies();
//   Logger.info('All enemies with loot:', allEnemies);

//   // Get enemies by loot ID
//   const enemiesWithLoot = await enemyDAL.getEnemiesByLootId(1);
//   Logger.info('Enemies with loot ID 1:', enemiesWithLoot);

//   // Update enemy's loot
//   const updated = await enemyDAL.updateEnemyLoot(enemy.id, 2);
//   Logger.info('Updated enemy loot:', updated);
// }
// example();

///////////////////////////////////////////////////////////////////////////////
// CharacterDAL is an abstract class that provides base data access layer operations for characters
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { ICharacter, CharacterDbModel } from "../models/character.model";
import { Op } from "sequelize";

export abstract class CharacterDAL {
  protected dbModel: typeof CharacterDbModel;

  constructor(dbModel: typeof CharacterDbModel) {
    this.dbModel = dbModel;
  }

  // Create a new character
  async createCharacter(character: Omit<ICharacter, 'id'>): Promise<ICharacter> {
    try {
      const newCharacter = await this.dbModel.create(character);
      return newCharacter.toJSON();
    } catch (error) {
      Logger.error(`CharacterDAL:createCharacter - Failed to create character: ${error}`);
      throw error;
    }
  }

  // Read a character by ID
  async getCharacterById(id: number): Promise<ICharacter | null> {
    try {
      const character = await this.dbModel.findByPk(id);
      return character?.toJSON() || null;
    } catch (error) {
      Logger.error(`CharacterDAL:getCharacterById - Failed to get character by id ${id}: ${error}`);
      throw error;
    }
  }

  // Read all characters
  async getAllCharacters(): Promise<ICharacter[]> {
    try {
      const characters = await this.dbModel.findAll();
      return characters.map(character => character.toJSON());
    } catch (error) {
      Logger.error(`CharacterDAL:getAllCharacters - Failed to get all characters: ${error}`);
      throw error;
    }
  }

  // Update a character
  async updateCharacter(id: number, character: Partial<ICharacter>): Promise<ICharacter | null> {
    try {
      const [updated] = await this.dbModel.update(character, {
        where: { id },
        returning: true
      });
      if (updated) {
        const updatedCharacter = await this.dbModel.findByPk(id);
        return updatedCharacter?.toJSON() || null;
      }
      return null;
    } catch (error) {
      Logger.error(`CharacterDAL:updateCharacter - Failed to update character ${id}: ${error}`);
      throw error;
    }
  }

  // Delete a character
  async deleteCharacter(id: number): Promise<boolean> {
    try {
      const deleted = await this.dbModel.destroy({
        where: { id }
      });
      if (deleted > 0) {
        Logger.debug(`CharacterDAL:deleteCharacter - Character with id ${id} deleted`);
        return true;
      } else {
        Logger.warn(`CharacterDAL:deleteCharacter - Character with id ${id} not found`);
        return false;
      }
    } catch (error) {
      Logger.error(`CharacterDAL:deleteCharacter - Failed to delete character ${id}: ${error}`);
      throw error;
    }
  }

  // Get characters by level range
  async getCharacterByLevelRange(minLevel: number, maxLevel: number): Promise<ICharacter[]> {
    try {
      const characters = await this.dbModel.findAll({
        where: {
          level: {
            [Op.between]: [minLevel, maxLevel]
          }
        }
      });
      return characters.map(character => character.toJSON());
    } catch (error) {
      Logger.error(`CharacterDAL:getCharacterByLevelRange - Failed to get characters by level range ${minLevel}-${maxLevel}: ${error}`);
      throw error;
    }
  }

  // Get characters by name (partial match)
  async getCharacterByName(name: string): Promise<ICharacter[]> {
    try {
      const characters = await this.dbModel.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`
          }
        }
      });
      return characters.map(character => character.toJSON());
    } catch (error) {
      Logger.error(`CharacterDAL:getCharacterByName - Failed to get characters by name ${name}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { characterSequelize } from "../models/character.model";

// class ExampleCharacterDAL extends CharacterDAL {
//   constructor(dbModel: typeof CharacterDbModel) {
//     super(dbModel);
//   }
// }

// async function example() {
//   const characterDb = characterSequelize(baseDatabase);
//   const characterDAL = new ExampleCharacterDAL(characterDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');

//   const character = await characterDAL.createCharacter({ name: "Test Character", level: 1, health: 100, attackPower: 10, luck: 1 });
//   Logger.info('created character:', character);

//   const character2 = await characterDAL.getCharacterById(character.id);
//   Logger.info('got character by id:', character2);

//   const character3 = await characterDAL.getCharacterByLevelRange(1, 10);
//   Logger.info('got character by level range:', character3);

//   const character4 = await characterDAL.getCharacterByName("Test");
//   Logger.info('got character by name:', character4);

//   const character5 = await characterDAL.updateCharacter(character.id, { name: "Updated Character" });
//   Logger.info('updated character:', character5);

//   const character6 = await characterDAL.deleteCharacter(character.id);
//   Logger.info('deleted character:', character6);
// }
// example();

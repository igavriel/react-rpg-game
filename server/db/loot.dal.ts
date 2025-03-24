///////////////////////////////////////////////////////////////////////////////
// LootDAL is a class that provides data access layer operations for loot
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { ILoot, LootDbModel } from "../models/loot.model";
import { Op } from "sequelize";

export class LootDAL {
  private dbModel: typeof LootDbModel;

  constructor(dbModel: typeof LootDbModel) {
    this.dbModel = dbModel;
  }

  // Create a new loot item
  async create(loot: Omit<ILoot, 'id'>): Promise<ILoot> {
    try {
      const newLoot = await this.dbModel.create(loot);
      return newLoot.toJSON();
    } catch (error) {
      Logger.error(`Failed to create loot: ${error}`);
      throw error;
    }
  }

  // Read a loot item by ID
  async getById(id: number): Promise<ILoot | null> {
    try {
      const loot = await this.dbModel.findByPk(id);
      return loot?.toJSON() || null;
    } catch (error) {
      Logger.error(`Failed to get loot by id ${id}: ${error}`);
      throw error;
    }
  }

  // Read all loot items
  async getAll(): Promise<ILoot[]> {
    try {
      const loots = await this.dbModel.findAll();
      return loots.map(loot => loot.toJSON());
    } catch (error) {
      Logger.error(`Failed to get all loot: ${error}`);
      throw error;
    }
  }

  // Update a loot item
  async update(id: number, loot: Partial<ILoot>): Promise<ILoot | null> {
    try {
      const [updated] = await this.dbModel.update(loot, {
        where: { id },
        returning: true
      });
      if (updated) {
        const updatedLoot = await this.dbModel.findByPk(id);
        return updatedLoot?.toJSON() || null;
      }
      return null;
    } catch (error) {
      Logger.error(`Failed to update loot ${id}: ${error}`);
      throw error;
    }
  }

  // Delete a loot item
  async delete(id: number): Promise<boolean> {
    try {
      const deleted = await this.dbModel.destroy({
        where: { id }
      });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to delete loot ${id}: ${error}`);
      throw error;
    }
  }

  // Get loot items by value range
  async getByValueRange(minValue: number, maxValue: number): Promise<ILoot[]> {
    try {
      const loots = await this.dbModel.findAll({
        where: {
          value: {
            [Op.between]: [minValue, maxValue]
          }
        }
      });
      return loots.map(loot => loot.toJSON());
    } catch (error) {
      Logger.error(`Failed to get loot by value range ${minValue}-${maxValue}: ${error}`);
      throw error;
    }
  }

  // Get loot items by name (partial match)
  async getByName(name: string): Promise<ILoot[]> {
    try {
      const loots = await this.dbModel.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`
          }
        }
      });
      return loots.map(loot => loot.toJSON());
    } catch (error) {
      Logger.error(`Failed to get loot by name ${name}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { lootSequelize } from "../models/loot.model";
// async function example() {
//   const lootDb = lootSequelize(baseDatabase);
//   const lootDAL = new LootDAL(lootDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');


//   const loot = await lootDAL.create({ name: "Test Loot", value: 100 });
//   Logger.info('created loot:', loot);

//   const loot2 = await lootDAL.getById(loot.id);
//   Logger.info('got loot by id:', loot2);

//   const loot3 = await lootDAL.getByValueRange(100, 200);
//   Logger.info('got loot by value range:', loot3);

//   const loot4 = await lootDAL.getByName("Test");
//   Logger.info('got loot by name:', loot4);

//   const loot5 = await lootDAL.update(loot.id, { name: "Updated Loot" });
//   Logger.info('updated loot:', loot5);

//   const loot6 = await lootDAL.delete(loot.id);
//   Logger.info('deleted loot:', loot6);
// }
// example();

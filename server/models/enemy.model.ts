///////////////////////////////////////////////////////////////////////////////
// EnemyModel is a class that extends BaseModel and provides a model for enemies
///////////////////////////////////////////////////////////////////////////////
import { CharacterDbModel, characterSequelize, ICharacter } from "./character.model";
import { ILoot } from "./loot.model";
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";

interface IEnemy extends ICharacter {
  loot: ILoot;
}

interface IDbEnemy {
  loot: ILoot;
}

// Enemy model - File based
class EnemyFileModel extends BaseFileModel<IEnemy> {
  constructor() {
    super(constants.ENEMY_FILE);
  }
}

// Enemy model - Sequelize based
class EnemyDbModel extends Model implements IDbEnemy {
  declare id: number;
  declare loot: ILoot;
}

const enemySequelize = (sequelize: Sequelize) => {
  EnemyDbModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true,
      references: { model: CharacterDbModel, key: "id", }
    },
    loot: { type: DataTypes.JSON, allowNull: false },
  }, {
    sequelize,
    modelName: 'Enemy',
    tableName: 'enemy',
  });
  return EnemyDbModel;
};

export { IEnemy, EnemyFileModel, EnemyDbModel, enemySequelize };

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const enemyModel = new EnemyFileModel();
//     let enemy = { id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1, loot: { name: "Sword", value: 10 } };
//     enemyModel.save([enemy]);
//     const readEnemy = enemyModel.load();
//     console.log((await readEnemy).toString());

//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     const enemyDbModel = enemySequelize(baseDatabase);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');

//     // Step 1: Create a Character - without id
//     let characterEntry = { name: "Test", health: 100, attackPower: 10, luck: 0.5, level: 1 };
//     const character = await characterDbModel.create(characterEntry);
//     const charJson = character.toJSON();
//     ColorLogger.debug(`Character created: ${charJson.id} = ${charJson.name} ${charJson.health} ${charJson.attackPower} ${charJson.luck} ${charJson.level}`);

//     // Step 2: Create a Player linked to the Character using the character id
//     const newEntry = await enemyDbModel.create({
//       id: character.id,
//       loot: { name: "Sword", value: 10 }
//     });
//     ColorLogger.debug(`Created entry: ${newEntry.toJSON().id} ${newEntry.toJSON().loot.name} ${newEntry.toJSON().loot.value}`);

//     const allEntries = await enemyDbModel.findAll({
//       order: [['createdAt', 'DESC']] // Newest first
//     });
//     console.log('All entries:', allEntries.map(entry => entry.toJSON()));
//   } catch (error) {
//     console.error('Database error:', error);
//   } finally {
//     await baseDatabase.close();
//   }
// }
// example();
///////////////////////////////////////////////////////////////////////////////

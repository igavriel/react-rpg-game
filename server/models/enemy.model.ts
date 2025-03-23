///////////////////////////////////////////////////////////////////////////////
// EnemyModel is a class that extends BaseModel and provides a model for enemies
///////////////////////////////////////////////////////////////////////////////
import { CharacterDbModel, characterSequelize, ICharacter } from "./character.model";
import { LootDbModel, lootSequelize } from "./loot.model";
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";

interface IEnemy extends ICharacter {
  lootId: number;
}

interface IDbEnemy {
  lootId: number;
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
  declare lootId: number;
}

const enemySequelize = (sequelize: Sequelize, character: typeof CharacterDbModel, loot: typeof LootDbModel) => {
  EnemyDbModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true,
      references: { model: character, key: "id", }
    },
    lootId: { type: DataTypes.INTEGER, allowNull: false,
      references: { model: loot, key: "id" } },
  }, {
    sequelize,
    modelName: 'Enemy',
    tableName: 'enemy',
    underscored: true,  // Converts all camelCased columns to underscored
    timestamps: false,  // This disables the createdAt and updatedAt columns
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
//     let enemy = { id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1, lootId: 1 };
//     enemyModel.save([enemy]);
//     const readEnemy = enemyModel.load();
//     ColorLogger.info(readEnemy.toString());

//     // initialize the sequelize model
//     const lootDbModel = lootSequelize(baseDatabase);
//     const characterDbModel = characterSequelize(baseDatabase);
//     const enemyDbModel = enemySequelize(baseDatabase, characterDbModel, lootDbModel);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');

//     // Step 1: Create a Character - without id
//     let characterEntry = { name: "Test", health: 100, attackPower: 10, luck: 0.5, level: 1 };
//     const character = await characterDbModel.create(characterEntry);
//     const charJson = character.toJSON();
//     ColorLogger.debug(`Character created: ${charJson.id} = ${charJson.name} ${charJson.health} ${charJson.attackPower} ${charJson.luck} ${charJson.level}`);

//     // Step 2: Create a Loot - without id
//     let lootEntry = { name: "Sword", value: 10 };
//     const loot = await lootDbModel.create(lootEntry);
//     const lootJson = loot.toJSON();
//     ColorLogger.debug(`Loot created: ${lootJson.id} = ${lootJson.name} ${lootJson.value}`);

//     // Step 3: Create a Enemy linked to the Character using the character id
//     const newEntry = await enemyDbModel.create({
//       id: character.id,
//       lootId: loot.id
//     });
//     ColorLogger.debug(`Created entry: ${newEntry.toJSON().id} ${newEntry.toJSON().lootId}`);

//     const allEntries = await enemyDbModel.findAll({
//       order: [['id', 'DESC']]
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

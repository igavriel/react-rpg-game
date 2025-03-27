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
      references: { model: character, key: "id", },
      onDelete: "CASCADE"
    },
    lootId: { type: DataTypes.INTEGER, allowNull: false,
      references: { model: loot, key: "id" },
      onDelete: "CASCADE"
    },
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
// import { ColorLogger as Logger, LogLevel } from "../../utilities/colorLogger";
// async function example() {
//   Logger.setLevel(LogLevel.DEBUG);
//   const enemyModel = new EnemyFileModel();
//   let enemy = { id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1, lootId: 1 };
//   enemyModel.save([enemy]);
//   const readEnemy = enemyModel.load();
//   Logger.info(readEnemy.toString());
// }
// example();

import { DataTypes, Sequelize } from 'sequelize';
import { IGame, GameDbModel} from '../server/models/game.model';
import { GameDAL } from '../server/db/game.dal';
import { GameEnemyDbModel } from '../server/models/gameEnemy.model';
import { GameLootDbModel } from '../server/models/gameLoot.model';
import { EnemyDbModel } from '../server/models/enemy.model';
import { CharacterDbModel } from '../server/models/character.model';
import { LootDbModel } from '../server/models/loot.model';

function createGame(playerId: number): IGame {
  return { id: 0, playerId, score: 0, date: new Date("2025-04-01") };
}

describe('IGame interface', () => {
  test('should create a valid IGame object', () => {
    const keyVal: IGame = createGame(1);
    expect(keyVal).toEqual({ id: 0, playerId: 1, score: 0, date: new Date("2025-04-01") });
  });

  test('should have correct types for playerId and score', () => {
    const keyVal: IGame = createGame(1);
    expect(typeof keyVal.id).toBe('number');
    expect(typeof keyVal.playerId).toBe('number');
    expect(typeof keyVal.score).toBe('number');
    expect(typeof keyVal.date).toBe('object');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidKeyVal: IGame = { id: 0, playerId: 1, score: 'invalid', date: new Date() };
    expect(invalidKeyVal).toBeDefined(); // This line is just to use the variable
  });
});


describe('Game Database Integration Tests', () => {
  let testSequelize: Sequelize;
  let gameDAL: GameDAL;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    GameDbModel.init({
      id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      playerId: { type: DataTypes.INTEGER, allowNull: false },
      score:    { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
      date:     { type: DataTypes.DATE, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Game',
      tableName: 'game'
    });

    CharacterDbModel.init({
      name:  { type: DataTypes.STRING, allowNull: false },
      health: { type: DataTypes.INTEGER, allowNull: false },
      attackPower: { type: DataTypes.INTEGER, allowNull: false },
      luck: { type: DataTypes.FLOAT, allowNull: false },
      level: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Character',
      tableName: 'characters'
    });

    EnemyDbModel.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      lootId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Enemy',
      tableName: 'enemy'
    });

    GameEnemyDbModel.init({
      gameId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: GameDbModel, key: 'id' } },
      enemyId: { type: DataTypes.INTEGER, allowNull: false, references: { model: EnemyDbModel, key: 'id' } },
    }, {
      sequelize: testSequelize,
      modelName: 'GameEnemy',
      tableName: 'game_enemy',
      underscored: true, // Converts all camelCased columns to underscored
      timestamps: false, // This disables the createdAt and updatedAt columns
    });

    LootDbModel.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name:  { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Loot',
      tableName: 'loot'
    });

    GameLootDbModel.init({
      gameId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: GameDbModel, key: 'id' } },
      lootId: { type: DataTypes.INTEGER, allowNull: false, references: { model: LootDbModel, key: 'id' } },
    }, {
      sequelize: testSequelize,
      modelName: 'GameLoot',
      tableName: 'game_loot',
      underscored: true, // Converts all camelCased columns to underscored
      timestamps: false, // This disables the createdAt and updatedAt columns
    });

    await testSequelize.sync({ force: true });
    gameDAL = new GameDAL(GameDbModel, GameEnemyDbModel, GameLootDbModel);
  });

  beforeEach(async () => {
    await GameDbModel.destroy({ where: {} });
    await GameEnemyDbModel.destroy({ where: {} });
    await GameLootDbModel.destroy({ where: {} });
    await EnemyDbModel.destroy({ where: {} });
    await GameDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('GameDbModel: should create a new record', async () => {
    const testData = createGame(1);
    console.log(testData);
    const record = await GameDbModel.create(testData as any);

    expect(record.playerId).toBe(testData.playerId);
    expect(record.score).toBe(testData.score);
    expect(record.date).toBe(testData.date);
  });

  test('GameDbModel: should update an existing record', async () => {
    const testData = createGame(1);
    const created = await GameDbModel.create(testData as any);
    const updated = await created.update({ score: 75 });

    expect(updated.score).toBe(75);
    expect(updated.playerId).toBe(1);
  });

  test('GameDal: should create a new game', async () => {
    const testData = createGame(1);
    const result = await gameDAL.createGame(testData.playerId);

    expect(result).toBeDefined();
    expect(result.playerId).toBe(testData.playerId);
    expect(result.score).toBe(testData.score);
    expect(result.date).toBeDefined();
    expect(result.id).toBeDefined();
  });

  test('GameDal: should get game item by id', async () => {
    const testData = createGame(1);
    const created = await gameDAL.createGame(testData.playerId);
    const result = await gameDAL.getGameById(created.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.playerId).toBe(created.playerId);
    expect(result?.score).toBe(created.score);
    expect(result?.date).toBeDefined();
  });

  test('GameDal: should get all game items', async () => {
    const testData = [
      { playerId: 1 },
      { playerId: 2 }
    ];

    await Promise.all(
      testData.map(data => gameDAL.createGame(data.playerId)));
    const allRecords = await gameDAL.getAllGames();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(l => l.playerId)).toContain(1);
    expect(allRecords.map(l => l.playerId)).toContain(2);
  });

  test('GameDal: should update a game item', async () => {
    const testData = createGame(1);
    const created = await gameDAL.createGame(testData.playerId);
    await gameDAL.updateGame(created.id, { score: 200 });
    const updated = await gameDAL.getGameById(created.id);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.playerId).toBe(created.playerId);
    expect(updated?.score).toBe(200);
  });

  test('GameDal: should delete a game item', async () => {
    const testData = createGame(1);
    const created = await gameDAL.createGame(testData.playerId);

    const deleted = await gameDAL.deleteGame(created.id);
    expect(deleted).toBe(true);

    const retrieved = await gameDAL.getGameById(created.id);
    expect(retrieved).toBeNull();
  });

  test('GameDal: should get game items by player', async () => {
    const testData = [
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 }
    ];

    await Promise.all(testData.map(data => gameDAL.createGame(data.playerId)));
    const rangeLoot = await gameDAL.getGamesByPlayerId(2);

    expect(rangeLoot).toHaveLength(1);
    expect(rangeLoot[0].playerId).toBe(2);
  });

  test('GameDal: should handle errors gracefully', async () => {
    // Test getting non-existent game
    const nonExistent = await gameDAL.getGameById(999);
    expect(nonExistent).toBeNull();

    // Test updating non-existent game
    const updateResult = await gameDAL.updateGame(999, { score: 100  });
    expect(updateResult).toBeNull();

    // Test deleting non-existent game
    const deleteResult = await gameDAL.deleteGame(999);
    expect(deleteResult).toBe(false);
  });

});

describe('Game Database Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GameDbModel: should create record via mock', async () => {
    const mockData = { playerId: 1, score: 200, date: new Date() };
    // Properly mock the Sequelize model
    jest.spyOn(GameDbModel, 'create').mockImplementation(() =>
      Promise.resolve(GameDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await GameDbModel.create(mockData);

    expect(GameDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.playerId).toBe(mockData.playerId);
    expect(result.score).toBe(mockData.score);
  });

  test('GameDbModel: should update record via mock', async () => {
    const mockUpdate = { score: 300 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, playerId: 1 })
    };
    (GameDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await GameDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.score).toBe(300);
  });
});
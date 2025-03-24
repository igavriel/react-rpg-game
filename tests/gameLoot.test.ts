import { DataTypes, Sequelize } from 'sequelize';
import { IGameLoot, GameLootDbModel } from '../server/models/gameLoot.model';

function createGameLoot(gameId: number, lootId: number): IGameLoot {
  return { gameId, lootId };
}

describe('IGameLoot interface', () => {
  test('should create a valid IGameLoot object', () => {
    const loot: IGameLoot = createGameLoot(1, 2);
    expect(loot).toEqual({ gameId: 1, lootId: 2 });
  });

  test('should have correct types for gameId and lootId', () => {
    const loot: IGameLoot = createGameLoot(1, 2);
    expect(typeof loot.gameId).toBe('number');
    expect(typeof loot.lootId).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidLoot: IGameLoot = { gameId: "1", lootId: 2 };
    expect(invalidLoot).toBeDefined(); // This line is just to use the variable
  });
});


describe('GameLootDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    GameLootDbModel.init({
      gameId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      lootId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'GameLoot',
      tableName: 'game_loot'
    });

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await GameLootDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { gameId: 1, lootId: 2 };
    const record = await GameLootDbModel.create(testData);

    expect(record.gameId).toBe(testData.gameId);
    expect(record.lootId).toBe(testData.lootId);
  });

  test('should update an existing record', async () => {
    const created = await GameLootDbModel.create({ gameId: 1, lootId: 2 });
    const updated = await created.update({ lootId: 3 });

    expect(updated.lootId).toStrictEqual(3);
  });
});


describe('GameLootDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
    const mockData = { gameId: 1, lootId: 2 };
    // Properly mock the Sequelize model
    jest.spyOn(GameLootDbModel, 'create').mockImplementation(() =>
      Promise.resolve(GameLootDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await GameLootDbModel.create(mockData);

    expect(GameLootDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.lootId).toBe(mockData.lootId);
  });

  test('should update record via mock', async () => {
    const mockUpdate = { lootId: 3 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, lootId: 3 })
    };
    (GameLootDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await GameLootDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.lootId).toStrictEqual(mockUpdate.lootId);
  });
});

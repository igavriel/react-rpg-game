import { DataTypes, Sequelize } from 'sequelize';
import { IGame, GameDbModel } from '../server/models/game.model';

function createGame(playerId: number, score: number): IGame {
  return { id: 0, playerId, score, date: new Date("2025-04-01") };
}

describe('IGame interface', () => {
  test('should create a valid IGame object', () => {
    const keyVal: IGame = createGame(1, 42);
    expect(keyVal).toEqual({ id: 0, playerId: 1, score: 42, date: new Date("2025-04-01") });
  });

  test('should have correct types for playerId and score', () => {
    const keyVal: IGame = createGame(1, 42);
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


describe('GameDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

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

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await GameDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { playerId: 1, score: 100, date: new Date() };
    const record = await GameDbModel.create(testData);

    expect(record.playerId).toBe(testData.playerId);
    expect(record.score).toBe(testData.score);
    expect(record.date).toBe(testData.date);
  });

  test('should update an existing record', async () => {
    const created = await GameDbModel.create({ playerId: 1, score: 100, date: new Date() });
    const updated = await created.update({ score: 75 });

    expect(updated.score).toBe(75);
    expect(updated.playerId).toBe(1);
  });
});



describe('GameDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
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

  test('should update record via mock', async () => {
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
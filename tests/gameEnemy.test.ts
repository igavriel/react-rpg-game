import { DataTypes, Sequelize } from 'sequelize';
import { IGameEnemy, GameEnemyDbModel, GameEnemyFileModel } from '../server/models/gameEnemy.model';

function createGameEnemy(gameId: number, enemyId: number): IGameEnemy {
  return { gameId, enemyId };
}

describe('IGameEnemy interface', () => {
  test('should create a valid IGameEnemy object', () => {
    const enemy: IGameEnemy = createGameEnemy(1, 2);
    expect(enemy).toEqual({ gameId: 1, enemyId: 2 });
  });

  test('should have correct types for gameId and enemyId', () => {
    const enemy: IGameEnemy = createGameEnemy(1, 2);
    expect(typeof enemy.gameId).toBe('number');
    expect(typeof enemy.enemyId).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidEnemy: IGameEnemy = { gameId: "1", enemyId: 2 };
    expect(invalidEnemy).toBeDefined(); // This line is just to use the variable
  });
});


describe('GameEnemyDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    GameEnemyDbModel.init({
      gameId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      enemyId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'GameEnemy',
      tableName: 'game_enemy'
    });

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await GameEnemyDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { gameId: 1, enemyId: 2 };
    const record = await GameEnemyDbModel.create(testData);

    expect(record.gameId).toBe(testData.gameId);
    expect(record.enemyId).toBe(testData.enemyId);
  });

  test('should update an existing record', async () => {
    const created = await GameEnemyDbModel.create({ gameId: 1, enemyId: 2 });
    const updated = await created.update({ enemyId: 3 });

    expect(updated.enemyId).toStrictEqual(3);
  });
});


describe('GameEnemyDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
    const mockData = { gameId: 1, enemyId: 2 };
    // Properly mock the Sequelize model
    jest.spyOn(GameEnemyDbModel, 'create').mockImplementation(() =>
      Promise.resolve(GameEnemyDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await GameEnemyDbModel.create(mockData);

    expect(GameEnemyDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.enemyId).toBe(mockData.enemyId);
  });

  test('should update record via mock', async () => {
    const mockUpdate = { enemyId: 3 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, enemyId: 3 })
    };
    (GameEnemyDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await GameEnemyDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.enemyId).toStrictEqual(mockUpdate.enemyId);
  });
});

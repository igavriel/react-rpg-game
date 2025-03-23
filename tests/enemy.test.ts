import { DataTypes, Sequelize } from 'sequelize';
import { IEnemy, EnemyDbModel, EnemyFileModel } from '../server/models/enemy.model';

function createEnemy(name: string): IEnemy {
  return { id: 1, name, health: 100, attackPower: 10, luck: 0.5, level: 1, lootId: 0 };
}

describe('IEnemy interface', () => {
  test('should create a valid IEnemy object', () => {
    const enemy: IEnemy = createEnemy('test');
    expect(enemy).toEqual({ id: 1, name: 'test', health: 100, attackPower: 10, luck: 0.5, level: 1, lootId: 0 });
  });

  test('should have correct types for name and value', () => {
    const enemy: IEnemy = createEnemy('example');
    expect(typeof enemy.name).toBe('string');
    expect(typeof enemy.health).toBe('number');
    expect(typeof enemy.attackPower).toBe('number');
    expect(typeof enemy.luck).toBe('number');
    expect(typeof enemy.level).toBe('number');
    expect(typeof enemy.lootId).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidEnemy: IEnemy = { id: 1, name: 123, health: 'invalid', attackPower: 10, luck: 0.5, level: 1, lootId: 0 };
    expect(invalidEnemy).toBeDefined(); // This line is just to use the variable
  });
});


describe('EnemyDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    EnemyDbModel.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      lootId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Enemy',
      tableName: 'enemy'
    });

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await EnemyDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { id: 1, lootId: 0 };
    const record = await EnemyDbModel.create(testData);

    expect(record.lootId).toBe(testData.lootId);
  });

  test('should update an existing record', async () => {
    const created = await EnemyDbModel.create({ id: 1, lootId: 0 });
    const updated = await created.update({ lootId: 0 });

    expect(updated.lootId).toStrictEqual(0);
  });
});


describe('EnemyDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
    const mockData = { id: 1, lootId: 0 };
    // Properly mock the Sequelize model
    jest.spyOn(EnemyDbModel, 'create').mockImplementation(() =>
      Promise.resolve(EnemyDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await EnemyDbModel.create(mockData);

    expect(EnemyDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.lootId).toBe(mockData.lootId);
  });

  test('should update record via mock', async () => {
    const mockUpdate = { lootId: 0 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, lootId: 0 })
    };
    (EnemyDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await EnemyDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.lootId).toStrictEqual(mockUpdate.lootId);
  });
});

import { DataTypes, Sequelize } from 'sequelize';
import { IEnemy, EnemyDbModel } from '../server/models/enemy.model';
import { EnemyDAL } from '../server/db/enemy.dal';
import { CharacterDbModel } from '../server/models/character.model';

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


describe('Enemy Database Integration Tests', () => {
  let testSequelize: Sequelize;
  let enemyDAL: EnemyDAL;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
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

    await testSequelize.sync({ force: true });
    enemyDAL = new EnemyDAL(CharacterDbModel, EnemyDbModel);
  });

  beforeEach(async () => {
    await EnemyDbModel.destroy({ where: {} });
    await CharacterDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('EnemyDbModel: should create a new record', async () => {
    const testData = { id: 1, lootId: 0 };
    const record = await EnemyDbModel.create(testData);

    expect(record.lootId).toBe(testData.lootId);
  });

  test('EnemyDbModel: should update an existing record', async () => {
    const created = await EnemyDbModel.create({ id: 1, lootId: 0 });
    const updated = await created.update({ lootId: 0 });

    expect(updated.lootId).toStrictEqual(0);
  });


  test('enemyDAL: should create a new Enemy item', async () => {
    const testData = createEnemy('createTest');
    const result = await enemyDAL.createEnemy(testData);

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
    expect(result.health).toBe(testData.health);
    expect(result.attackPower).toBe(testData.attackPower);
    expect(result.luck).toBe(testData.luck);
    expect(result.level).toBe(testData.level);
    expect(result.id).toBeDefined();
    expect(result.lootId).toBe(testData.lootId);
  });

  test('enemyDAL: should get Enemy item by id', async () => {
    const testData = createEnemy('createTest1');
    const created = await enemyDAL.createEnemy(testData);
    const result = await enemyDAL.getEnemyById(created.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe(created.name);
    expect(result?.health).toBe(created.health);
    expect(result?.attackPower).toBe(created.attackPower);
    expect(result?.luck).toBe(created.luck);
    expect(result?.level).toBe(created.level);
    expect(result?.lootId).toBe(created.lootId);
  });

  test('enemyDAL: should get all Enemy items', async () => {
    const testData = [
      { name: "test3", health: 300, attackPower: 30, luck: 0.5, level: 3, lootId: 0 },
      { name: "test4", health: 400, attackPower: 40, luck: 0.5, level: 4, lootId: 0 }
    ];

    await Promise.all(
      testData.map(data => enemyDAL.createEnemy(data)));
    const allRecords = await enemyDAL.getAllEnemies();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(l => l.name)).toContain('test3');
    expect(allRecords.map(l => l.name)).toContain('test4');
  });

  test('enemyDAL: should update a Enemy item', async () => {
    const testData = createEnemy('updateTest');
    const created = await enemyDAL.createEnemy(testData);
    await enemyDAL.updateEnemyLoot(created.id, 2);
    const updated = await enemyDAL.getEnemyById(created.id);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.name).toBe(created.name);
    expect(updated?.lootId).toBe(2);
  });

  test('enemyDAL: should delete a Enemy item', async () => {
    const testData = createEnemy('createTest');
    const created = await enemyDAL.createEnemy(testData);

    const deleted = await enemyDAL.deleteEnemy(created.id);
    expect(deleted).toBe(true);

    const retrieved = await enemyDAL.getEnemyById(created.id);
    expect(retrieved).toBeNull();
  });

  test('enemyDAL: should handle errors gracefully', async () => {
    // Test getting non-existent Player
    const nonExistent = await enemyDAL.getEnemyById(999);
    expect(nonExistent).toBeNull();

    // Test deleting non-existent Player
    const deleteResult = await enemyDAL.deleteEnemy(999);
    expect(deleteResult).toBe(false);
  });

});


describe('Enemy Database Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('EnemyDbModel: should create record via mock', async () => {
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

  test('EnemyDbModel: should update record via mock', async () => {
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

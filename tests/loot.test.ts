import { DataTypes, Sequelize } from 'sequelize';
import { ILoot, LootDbModel, LootFileModel } from '../server/models/loot.model';

function createLoot(name: string, value: number): ILoot {
  return { name, value };
}

describe('ILoot interface', () => {
  test('should create a valid ILoot object', () => {
    const keyVal: ILoot = createLoot('test', 42);
    expect(keyVal).toEqual({ name: 'test', value: 42 });
  });

  test('should have correct types for name and value', () => {
    const keyVal: ILoot = createLoot('example', 100);
    expect(typeof keyVal.name).toBe('string');
    expect(typeof keyVal.value).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidKeyVal: ILoot = { name: 123, value: 'invalid' };
    expect(invalidKeyVal).toBeDefined(); // This line is just to use the variable
  });
});


describe('LootDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    LootDbModel.init({
      name:  { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Loot',
      tableName: 'loot'
    });

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await LootDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { name: 'test1', value: 100 };
    const record = await LootDbModel.create(testData);

    expect(record.name).toBe(testData.name);
    expect(record.value).toBe(testData.value);
  });

  test('should update an existing record', async () => {
    const created = await LootDbModel.create({ name: 'updateTest', value: 50 });
    const updated = await created.update({ value: 75 });

    expect(updated.value).toBe(75);
    expect(updated.name).toBe('updateTest');
  });
});



describe('LootDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
    const mockData = { name: 'mockTest', value: 200 };
    // Properly mock the Sequelize model
    jest.spyOn(LootDbModel, 'create').mockImplementation(() =>
      Promise.resolve(LootDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await LootDbModel.create(mockData);

    expect(LootDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.name).toBe(mockData.name);
    expect(result.value).toBe(mockData.value);
  });

  test('should update record via mock', async () => {
    const mockUpdate = { value: 300 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, name: 'updateMock' })
    };
    (LootDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await LootDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.value).toBe(300);
  });
});
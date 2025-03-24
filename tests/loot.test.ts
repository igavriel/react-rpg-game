import { DataTypes, Sequelize } from 'sequelize';
import { ILoot, LootDbModel, LootFileModel } from '../server/models/loot.model';
import { LootDAL } from '../server/db/loot.dal';

///////////////////////////////////////////////////////////////////////////////

function createLoot(name: string, value: number): ILoot {
  return { id: 0, name, value };
}

describe('ILoot interface', () => {
  test('should create a valid ILoot object', () => {
    const keyVal: ILoot = createLoot('test', 42);
    expect(keyVal).toEqual({ id: 0, name: 'test', value: 42 });
  });

  test('should have correct types for name and value', () => {
    const keyVal: ILoot = createLoot('example', 100);
    expect(typeof keyVal.id).toBe('number');
    expect(typeof keyVal.name).toBe('string');
    expect(typeof keyVal.value).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidKeyVal: ILoot = { id: 0, name: 123, value: 'invalid' };
    expect(invalidKeyVal).toBeDefined(); // This line is just to use the variable
  });
});

///////////////////////////////////////////////////////////////////////////////

describe('LootDbModel Integration Tests', () => {
  let testSequelize: Sequelize;
  let lootDAL: LootDAL;

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
    lootDAL = new LootDAL(LootDbModel);
  });

  beforeEach(async () => {
    await LootDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('LootDbModel: should create a new loot', async () => {
    const testData = createLoot('createTest', 100);
    const result = await LootDbModel.create(testData as any);

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
    expect(result.value).toBe(testData.value);
    expect(result.id).toBeDefined();
  });

  test('LootDbModel: should update an existing loot', async () => {
    const testData = createLoot('updateTest', 100);
    const created = await LootDbModel.create(testData as any);
    const updated = await created.update({ value: 2 });

    expect(updated.value).toBe(2);
    expect(updated.name).toBe(created.name);
    expect(updated.id).toBe(created.id);
  });

  test('LootDAL: should create a new loot item', async () => {
    const testData = createLoot('createTest', 100);
    const result = await lootDAL.create(testData);

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
    expect(result.value).toBe(testData.value);
    expect(result.id).toBeDefined();
  });

  test('LootDAL: should get loot item by id', async () => {
    const testData = createLoot('createTest', 100);
    const created = await lootDAL.create(testData);
    const result = await lootDAL.getById(created.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe(created.name);
    expect(result?.value).toBe(created.value);
  });

  test('LootDAL:should get all loot items', async () => {
    const testData = [
      { name: 'test3', value: 300 },
      { name: 'test4', value: 400 }
    ];

    await Promise.all(
      testData.map(data => lootDAL.create(data)));
    const allRecords = await lootDAL.getAll();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(l => l.name)).toContain('test3');
    expect(allRecords.map(l => l.name)).toContain('test4');
  });

  // test('LootDAL: should update a loot item', async () => {
  //   const created = await lootDAL.create({ name: 'updateTest', value: 1 });
  //   const updated = await lootDAL.update(created.id, { value: 2 });

  //   expect(updated).toBeDefined();
  //   expect(updated?.id).toBe(created.id);
  //   expect(updated?.name).toBe(created.name);
  //   expect(updated?.value).toBe(2);
  // });

  test('LootDAL: should delete a loot item', async () => {
    const testData = createLoot('createTest', 100);
    const created = await lootDAL.create(testData);

    const deleted = await lootDAL.delete(created.id);
    expect(deleted).toBe(true);

    const retrieved = await lootDAL.getById(created.id);
    expect(retrieved).toBeNull();
  });

  test('LootDAL: should get loot items by value range', async () => {
    const testData = [
      { name: 'test7', value: 100 },
      { name: 'test8', value: 200 },
      { name: 'test9', value: 300 }
    ];

    await Promise.all(testData.map(data => lootDAL.create(data)));
    const rangeLoot = await lootDAL.getByValueRange(150, 250);

    expect(rangeLoot).toHaveLength(1);
    expect(rangeLoot[0].name).toBe('test8');
    expect(rangeLoot[0].value).toBe(200);
  });

  test('LootDAL: should get loot items by name (partial match)', async () => {
    const testData = [
      { name: 'sword', value: 100 },
      { name: 'shield', value: 200 },
      { name: 'sword of power', value: 300 }
    ];

    await Promise.all(testData.map(data => lootDAL.create(data)));
    const swordLoot = await lootDAL.getByName('sword');

    expect(swordLoot).toHaveLength(2);
    expect(swordLoot.map(l => l.name)).toContain('sword');
    expect(swordLoot.map(l => l.name)).toContain('sword of power');
  });


  test('LootDAL: should handle errors gracefully', async () => {
    // Test getting non-existent loot
    const nonExistent = await lootDAL.getById(999);
    expect(nonExistent).toBeNull();

    // Test updating non-existent loot
    const updateResult = await lootDAL.update(999, { value: 100 });
    expect(updateResult).toBeNull();

    // Test deleting non-existent loot
    const deleteResult = await lootDAL.delete(999);
    expect(deleteResult).toBe(false);
  });
});

///////////////////////////////////////////////////////////////////////////////

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

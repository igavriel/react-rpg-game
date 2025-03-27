import { DataTypes, Sequelize } from 'sequelize';
import { ICharacter,  CharacterDbModel } from '../server/models/character.model';
import { CharacterDAL } from '../server/db/character.dal';

function createCharacter(name: string): ICharacter {
  return { id: 1, name, health: 100, attackPower: 10, luck: 0.5, level: 1 };
}

describe('ICharacter interface', () => {
  test('should create a valid ICharacter object', () => {
    const character: ICharacter = createCharacter('test');
    expect(character).toEqual({ id: 1, name: 'test', health: 100, attackPower: 10, luck: 0.5, level: 1 });
  });

  test('should have correct types for name and value', () => {
    const character: ICharacter = createCharacter('example');
    expect(typeof character.name).toBe('string');
    expect(typeof character.health).toBe('number');
    expect(typeof character.attackPower).toBe('number');
    expect(typeof character.luck).toBe('number');
    expect(typeof character.level).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidCharacter: ICharacter = { name: 123, health: 'invalid', attackPower: 10, luck: 0.5, level: 1 };
    expect(invalidCharacter).toBeDefined(); // This line is just to use the variable
  });
});

class CharacterDALMock extends CharacterDAL {
  constructor(dbModel: typeof CharacterDbModel) {
    super(dbModel);
  }
}

describe('Character Database Integration Tests', () => {
  let testSequelize: Sequelize;
  let characterDAL: CharacterDALMock;

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

    await testSequelize.sync({ force: true });
    characterDAL = new CharacterDALMock(CharacterDbModel);
  });

  beforeEach(async () => {
    await CharacterDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('CharacterDbModel: should create a new record', async () => {
    const testData = createCharacter('test1');
    const record = await CharacterDbModel.create(testData as any);

    expect(record.name).toBe(testData.name);
    expect(record.health).toBe(testData.health);
    expect(record.attackPower).toBe(testData.attackPower);
    expect(record.luck).toBe(testData.luck);
    expect(record.level).toBe(testData.level);
  });

  test('CharacterDbModel: should update an existing record', async () => {
    const testData = createCharacter('updateTest');
    const created = await CharacterDbModel.create(testData as any);
    const updated = await created.update({ health: 75 });

    expect(updated.health).toBe(75);
    expect(updated.name).toBe('updateTest');
  });

  test('CharacterDAL: should create a new Character item', async () => {
    const testData = createCharacter('createTest');
    const result = await characterDAL.createCharacter(testData);

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
    expect(result.health).toBe(testData.health);
    expect(result.attackPower).toBe(testData.attackPower);
    expect(result.luck).toBe(testData.luck);
    expect(result.level).toBe(testData.level);
    expect(result.id).toBeDefined();
  });

  test('CharacterDAL: should get Character item by id', async () => {
    const testData = createCharacter('createTest');
    const created = await characterDAL.createCharacter(testData);
    const result = await characterDAL.getCharacterById(created.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe(created.name);
    expect(result?.health).toBe(created.health);
    expect(result?.attackPower).toBe(created.attackPower);
    expect(result?.luck).toBe(created.luck);
    expect(result?.level).toBe(created.level);
  });

  test('CharacterDAL: should get all Character items', async () => {
    const testData = [
      { name: "test3", health: 300, attackPower: 30, luck: 0.5, level: 3 },
      { name: "test4", health: 400, attackPower: 40, luck: 0.5, level: 4 }
    ];

    await Promise.all(
      testData.map(data => characterDAL.createCharacter(data)));
    const allRecords = await characterDAL.getAllCharacters();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(l => l.name)).toContain('test3');
    expect(allRecords.map(l => l.name)).toContain('test4');
  });

  test('CharacterDAL: should update a Character item', async () => {
    const testData = createCharacter('updateTest');
    const created = await characterDAL.createCharacter(testData);
    await characterDAL.updateCharacter(created.id, { health: 2 });
    const updated = await characterDAL.getCharacterById(created.id);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.name).toBe(created.name);
    expect(updated?.health).toBe(2);
  });

  test('CharacterDAL: should delete a Character item', async () => {
    const testData = createCharacter('createTest');
    const created = await characterDAL.createCharacter(testData);

    const deleted = await characterDAL.deleteCharacter(created.id);
    expect(deleted).toBe(true);

    const retrieved = await characterDAL.getCharacterById(created.id);
    expect(retrieved).toBeNull();
  });

  test('CharacterDAL: should get Character items by value range', async () => {
    const testData = [
      { name: "test7", health: 100, attackPower: 30, luck: 0.5, level: 10 },
      { name: "test8", health: 200, attackPower: 30, luck: 0.5, level: 20 },
      { name: "test9", health: 300, attackPower: 40, luck: 0.5, level: 30 }
    ];

    await Promise.all(testData.map(data => characterDAL.createCharacter(data)));
    const rangeCharacter = await characterDAL.getCharacterByLevelRange(15, 25);

    expect(rangeCharacter).toHaveLength(1);
    expect(rangeCharacter[0].name).toBe('test8');
    expect(rangeCharacter[0].health).toBe(200);
  });

  test('CharacterDAL: should get Character items by name (partial match)', async () => {
    const testData = [
      { name: "John", health: 100, attackPower: 30, luck: 0.5, level: 3 },
      { name: "test8", health: 200, attackPower: 30, luck: 0.5, level: 3 },
      { name: "John Doe", health: 300, attackPower: 40, luck: 0.5, level: 4 }
    ];

    await Promise.all(testData.map(data => characterDAL.createCharacter(data)));
    const swordCharacter = await characterDAL.getCharacterByName('John');

    expect(swordCharacter).toHaveLength(2);
    expect(swordCharacter.map(l => l.name)).toContain('John');
    expect(swordCharacter.map(l => l.name)).toContain('John Doe');
  });


  test('CharacterDAL: should handle errors gracefully', async () => {
    // Test getting non-existent Character
    const nonExistent = await characterDAL.getCharacterById(999);
    expect(nonExistent).toBeNull();

    // Test updating non-existent Character
    const updateResult = await characterDAL.updateCharacter(999, { health: 100 });
    expect(updateResult).toBeNull();

    // Test deleting non-existent Character
    const deleteResult = await characterDAL.deleteCharacter(999);
    expect(deleteResult).toBe(false);
  });

});


describe('Character Database Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('CharacterDbModel: should create record via mock', async () => {
    const mockData = { name: 'mockTest', health: 200, attackPower: 10, luck: 0.5, level: 1 };
    // Properly mock the Sequelize model
    jest.spyOn(CharacterDbModel, 'create').mockImplementation(() =>
      Promise.resolve(CharacterDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await CharacterDbModel.create(mockData);

    expect(CharacterDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.name).toBe(mockData.name);
    expect(result.health).toBe(mockData.health);
    expect(result.attackPower).toBe(mockData.attackPower);
    expect(result.luck).toBe(mockData.luck);
    expect(result.level).toBe(mockData.level);
  });

  test('CharacterDbModel: should update record via mock', async () => {
    const mockUpdate = { health: 300 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, name: 'updateMock' })
    };
    (CharacterDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await CharacterDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.health).toBe(300);
  });
});
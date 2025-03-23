import { DataTypes, Sequelize } from 'sequelize';
import { ICharacter,  CharacterDbModel, CharacterFileModel } from '../server/models/character.model';

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


describe('CharacterDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

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
  });

  beforeEach(async () => {
    await CharacterDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { name: 'test1', health: 100, attackPower: 10, luck: 0.5, level: 1 };
    const record = await CharacterDbModel.create(testData);

    expect(record.name).toBe(testData.name);
    expect(record.health).toBe(testData.health);
    expect(record.attackPower).toBe(testData.attackPower);
    expect(record.luck).toBe(testData.luck);
    expect(record.level).toBe(testData.level);
  });

  test('should update an existing record', async () => {
    const created = await CharacterDbModel.create({ name: 'updateTest', health: 100, attackPower: 10, luck: 0.5, level: 1 });
    const updated = await created.update({ health: 75 });

    expect(updated.health).toBe(75);
    expect(updated.name).toBe('updateTest');
  });
});


describe('CharacterDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
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

  test('should update record via mock', async () => {
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
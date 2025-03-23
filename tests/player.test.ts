import { DataTypes, Sequelize } from 'sequelize';
import { IPlayer, PlayerDbModel, PlayerFileModel } from '../server/models/player.model';

function createPlayer(name: string): IPlayer {
  return { id: 1, name, health: 100, attackPower: 10, luck: 0.5, level: 1, experience: 0, levelUpExperience: 100 };
}

describe('IPlayer interface', () => {
  test('should create a valid IPlayer object', () => {
    const player: IPlayer = createPlayer('test');
    expect(player).toEqual({ id: 1, name: 'test', health: 100, attackPower: 10, luck: 0.5, level: 1, experience: 0, levelUpExperience: 100 });
  });

  test('should have correct types for name and value', () => {
    const player: IPlayer = createPlayer('example');
    expect(typeof player.name).toBe('string');
    expect(typeof player.health).toBe('number');
    expect(typeof player.attackPower).toBe('number');
    expect(typeof player.luck).toBe('number');
    expect(typeof player.level).toBe('number');
    expect(typeof player.experience).toBe('number');
    expect(typeof player.levelUpExperience).toBe('number');
  });

  test('should not allow invalid types', () => {
    // @ts-expect-error
    const invalidPlayer: IPlayer = { name: 123, health: 'invalid', attackPower: 10, luck: 0.5, level: 1, experience: 0, levelUpExperience: 100 };
    expect(invalidPlayer).toBeDefined(); // This line is just to use the variable
  });
});


describe('PlayerDbModel Integration Tests', () => {
  let testSequelize: Sequelize;

  beforeAll(async () => {
    testSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // Use in-memory database
      logging: false,
    });

    PlayerDbModel.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      experience: { type: DataTypes.INTEGER, allowNull: false },
      levelUpExperience: { type: DataTypes.INTEGER, allowNull: false },
    }, {
      sequelize: testSequelize,
      modelName: 'Player',
      tableName: 'player'
    });

    await testSequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await PlayerDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('should create a new record', async () => {
    const testData = { id: 1, experience: 0, levelUpExperience: 100 };
    const record = await PlayerDbModel.create(testData);

    expect(record.experience).toBe(testData.experience);
    expect(record.levelUpExperience).toBe(testData.levelUpExperience);
  });

  test('should update an existing record', async () => {
    const created = await PlayerDbModel.create({ id: 1, experience: 0, levelUpExperience: 100 });
    const updated = await created.update({ experience: 75 });

    expect(updated.experience).toBe(75);
    expect(updated.levelUpExperience).toBe(100);
  });
});


describe('PlayerDbModel Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create record via mock', async () => {
    const mockData = { id: 1, experience: 0, levelUpExperience: 100 };
    // Properly mock the Sequelize model
    jest.spyOn(PlayerDbModel, 'create').mockImplementation(() =>
      Promise.resolve(PlayerDbModel.build({
        ...mockData,
        save: jest.fn().mockResolvedValue(true)
      }))
    );
    const result = await PlayerDbModel.create(mockData);

    expect(PlayerDbModel.create).toHaveBeenCalledWith(mockData);
    expect(result.experience).toBe(mockData.experience);
    expect(result.levelUpExperience).toBe(mockData.levelUpExperience);
  });

  test('should update record via mock', async () => {
    const mockUpdate = { experience: 300 };
    const mockInstance = {
      update: jest.fn().mockResolvedValue({ ...mockUpdate, experience: 300 })
    };
    (PlayerDbModel.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockInstance);

    const instance = await PlayerDbModel.findByPk(1);
    const updated = await instance?.update(mockUpdate);

    expect(instance?.update).toHaveBeenCalledWith(mockUpdate);
    expect(updated?.experience).toBe(300);
  });
});
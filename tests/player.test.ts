import { DataTypes, Sequelize } from 'sequelize';
import { IPlayer, PlayerDbModel } from '../server/models/player.model';
import { CharacterDbModel } from '../server/models/character.model';
import { PlayerDAL } from '../server/db/player.dal';

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


describe('Player Database Integration Tests', () => {
  let testSequelize: Sequelize;
  let playerDAL: PlayerDAL;

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
    playerDAL = new PlayerDAL(CharacterDbModel, PlayerDbModel);
  });

  beforeEach(async () => {
    await PlayerDbModel.destroy({ where: {} });
    await CharacterDbModel.destroy({ where: {} });
  });

  afterAll(async () => {
    await testSequelize.close();
  });

  test('PlayerDbModel: should create a new record', async () => {
    const testData = createPlayer('test');
    const record = await PlayerDbModel.create(testData as any);

    expect(record.experience).toBe(testData.experience);
    expect(record.levelUpExperience).toBe(testData.levelUpExperience);
  });

  test('PlayerDbModel:should update an existing record', async () => {
    const testData = createPlayer('test');
    const created = await PlayerDbModel.create(testData as any);
    const updated = await created.update({ experience: 75 });

    expect(updated.experience).toBe(75);
    expect(updated.levelUpExperience).toBe(100);
  });

  test('PlayerDAL: should create a new Player item', async () => {
    const testData = createPlayer('createTest');
    const result = await playerDAL.createPlayer(testData);

    expect(result).toBeDefined();
    expect(result.name).toBe(testData.name);
    expect(result.health).toBe(testData.health);
    expect(result.attackPower).toBe(testData.attackPower);
    expect(result.luck).toBe(testData.luck);
    expect(result.level).toBe(testData.level);
    expect(result.id).toBeDefined();
    expect(result.experience).toBe(testData.experience);
    expect(result.levelUpExperience).toBe(testData.levelUpExperience);
  });

  test('PlayerDAL: should get Player item by id', async () => {
    const testData = createPlayer('createTest1');
    const created = await playerDAL.createPlayer(testData);
    const result = await playerDAL.getPlayerById(created.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe(created.name);
    expect(result?.health).toBe(created.health);
    expect(result?.attackPower).toBe(created.attackPower);
    expect(result?.luck).toBe(created.luck);
    expect(result?.level).toBe(created.level);
    expect(result?.experience).toBe(created.experience);
    expect(result?.levelUpExperience).toBe(created.levelUpExperience);
  });

  test('PlayerDAL: should get all Player items', async () => {
    const testData = [
      { name: "test3", health: 300, attackPower: 30, luck: 0.5, level: 3, experience: 0, levelUpExperience: 100 },
      { name: "test4", health: 400, attackPower: 40, luck: 0.5, level: 4, experience: 0, levelUpExperience: 100 }
    ];

    await Promise.all(
      testData.map(data => playerDAL.createPlayer(data)));
    const allRecords = await playerDAL.getAllPlayers();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.map(l => l.name)).toContain('test3');
    expect(allRecords.map(l => l.name)).toContain('test4');
  });

  test('PlayerDAL: should update a Player item', async () => {
    const testData = createPlayer('updateTest');
    const created = await playerDAL.createPlayer(testData);
    await playerDAL.updatePlayerExperience(created.id, 2);
    const updated = await playerDAL.getPlayerById(created.id);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.name).toBe(created.name);
    expect(updated?.experience).toBe(2);
  });

  test('PlayerDAL: should delete a Player item', async () => {
    const testData = createPlayer('createTest');
    const created = await playerDAL.createPlayer(testData);

    const deleted = await playerDAL.deletePlayer(created.id);
    expect(deleted).toBe(true);

    const retrieved = await playerDAL.getPlayerById(created.id);
    expect(retrieved).toBeNull();
  });

  test('PlayerDAL: should handle errors gracefully', async () => {
    // Test getting non-existent Player
    const nonExistent = await playerDAL.getPlayerById(999);
    expect(nonExistent).toBeNull();

    // Test deleting non-existent Player
    const deleteResult = await playerDAL.deletePlayer(999);
    expect(deleteResult).toBe(false);
  });
});


describe('Player Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('PlayerDbModel: should create record via mock', async () => {
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

  test('PlayerDbModel: should update record via mock', async () => {
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
///////////////////////////////////////////////////////////////////////////////
// PlayerDAL is a class that provides data access layer operations for players
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { IPlayer, PlayerDbModel } from "../models/player.model";
import { CharacterDbModel } from "../models/character.model";
import { CharacterDAL } from "./character.dal";

export class PlayerDAL extends CharacterDAL {
  private playerModel: typeof PlayerDbModel;

  constructor(characterModel: typeof CharacterDbModel, playerModel: typeof PlayerDbModel) {
    super(characterModel);
    this.playerModel = playerModel;
  }

  // Create a new player
  async createPlayer(player: Omit<IPlayer, 'id'>): Promise<IPlayer> {
    try {
      // First create the character part
      const newCharacter = await this.createCharacter(player);

      // Then create the player part with experience
      const newPlayer = await this.playerModel.create({
        id: newCharacter.id,
        experience: player.experience,
        levelUpExperience: player.levelUpExperience
      });

      return {
        ...newCharacter,
        experience: newPlayer.experience,
        levelUpExperience: newPlayer.levelUpExperience
      };
    } catch (error) {
      Logger.error(`Failed to create player: ${error}`);
      throw error;
    }
  }

  // Get player by ID
  async getPlayerById(id: number): Promise<IPlayer | null> {
    try {
      const player = await this.playerModel.findByPk(id);
      if (!player) {
        Logger.error(`Player with id ${id} not found`);
        return null;
      }

      const character = await this.getCharacterById(id);
      if (!character) {
        Logger.error(`Character with id ${id} not found`);
        return null;
      }

      return {
        ...character,
        experience: player.experience,
        levelUpExperience: player.levelUpExperience
      };
    } catch (error) {
      Logger.error(`Failed to get player by id ${id}: ${error}`);
      throw error;
    }
  }

  // Get all players
  async getAllPlayers(): Promise<IPlayer[]> {
    try {
      const players = await this.playerModel.findAll();
      const characters = await this.getAllCharacters();

      return players.map(player => {
        const character = characters.find(c => c.id === player.id);
        if (!character) {
          Logger.error(`Character with id ${player.id} not found`);
          return null;
        }

        return {
          ...character,
          experience: player.experience,
          levelUpExperience: player.levelUpExperience
        };
      }).filter((player): player is IPlayer => player !== null);
    } catch (error) {
      Logger.error(`Failed to get all players: ${error}`);
      throw error;
    }
  }

  // Update player's experience
  async updatePlayerExperience(id: number, experience: number): Promise<boolean> {
    try {
      const [updated] = await this.playerModel.update(
        { experience },
        { where: { id } }
      );
      return updated > 0;
    } catch (error) {
      Logger.error(`Failed to update player ${id} experience: ${error}`);
      throw error;
    }
  }

  // Update player's level up experience
  async updatePlayerLevelUpExperience(id: number, levelUpExperience: number): Promise<boolean> {
    try {
      const [updated] = await this.playerModel.update(
        { levelUpExperience },
        { where: { id } }
      );
      return updated > 0;
    } catch (error) {
      Logger.error(`Failed to update player ${id} level up experience: ${error}`);
      throw error;
    }
  }

  // Delete player
  async deletePlayer(id: number): Promise<boolean> {
    try {
      const deleted = await this.playerModel.destroy({ where: { id: id } });
      return deleted > 0;
    } catch (error) {
      Logger.error(`Failed to delete player ${id}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { characterSequelize } from "../models/character.model";
// import { playerSequelize } from "../models/player.model";
// async function example() {
//   const characterDb = characterSequelize(baseDatabase);
//   const playerDb = playerSequelize(baseDatabase, characterDb);
//   const playerDAL = new PlayerDAL(characterDb, playerDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');

//   // Create a new player
//   const player = await playerDAL.createPlayer({
//     name: "Hero",
//     health: 100,
//     attackPower: 15,
//     luck: 0.5,
//     level: 1,
//     experience: 0,
//     levelUpExperience: 100
//   });
//   Logger.info('Created player:', player);

//   // Get player by ID
//   const playerWithExp = await playerDAL.getPlayerById(player.id);
//   Logger.info('Got player by id:', playerWithExp);

//   // Get all players
//   const allPlayers = await playerDAL.getAllPlayers();
//   Logger.info('All players:', allPlayers);

//   // Update player's experience
//   const updatedExp = await playerDAL.updatePlayerExperience(player.id, 150);
//   Logger.info('Updated player experience:', updatedExp);

//   // Update player's level up experience
//   const updatedLevelUpExp = await playerDAL.updatePlayerLevelUpExperience(player.id, 200);
//   Logger.info('Updated player level up experience:', updatedLevelUpExp);
// }
// example();

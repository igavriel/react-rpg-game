import { Game, Player, Character, Enemy, Loot } from "../generated-server/api";
import { ICharacter } from "../server/models/character.model";
import { IEnemy } from "../server/models/enemy.model";
import { IGame } from "../server/models/game.model";
import { ILoot } from "../server/models/loot.model";
import { IPlayer } from "../server/models/player.model";

export function convertLoot(loot: ILoot): Loot {
  let retVal: Loot = {};
  retVal.id = loot.id;
  retVal.name = loot.name;
  retVal.value = loot.value;
  return retVal;
}

export function convertCharacter(character: ICharacter): Character {
  let retVal: Character = {};
  retVal.id = character.id;
  retVal.name = character.name;
  retVal.health = character.health;
  retVal.attackPower = character.attackPower;
  retVal.luck = character.luck;
  retVal.level = character.level;
  return retVal;
}

export function convertPlayer(player: IPlayer) : Player {
  let retVal : Player = {};
  retVal.character = convertCharacter(player);
  retVal.experience = player.experience;
  retVal.levelUpExperience = player.levelUpExperience;
  return retVal;
}

export function convertEnemy(enemy: IEnemy, loot: ILoot): Enemy {
  let retVal: Enemy = {};
  retVal.character = convertCharacter(enemy);
  retVal.loot = convertLoot(loot);
  return retVal;
}

export function convertGame(game: IGame, player: IPlayer, enemies: IEnemy[], enemiesLoots: ILoot[], gameLoots: ILoot[]): Game {
  let retVal : Game = {};
  retVal.id = game.id;
  retVal.player = convertPlayer(player);
  retVal.score = game.score;
  retVal.createdAt = game.date;
  retVal.enemies = [];
  for (let i = 0; i < enemies.length; i++) {
    let enemyObj: Enemy = convertEnemy(enemies[i], enemiesLoots[i]);
    retVal.enemies.push(enemyObj);
  }
  retVal.loot = [];
  for (let i = 0; i < gameLoots.length; i++) {
    let lootObj: Loot = convertLoot(gameLoots[i]);
    retVal.loot.push(lootObj);
  }
  return retVal;
}

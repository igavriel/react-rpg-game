import { IEnemy } from "../models/enemy.model";
import { IPlayer } from "../models/player.model";
import { IGame } from "../models/game.model";
import { IGameEnemy } from "../models/gameEnemy.model";
import { IGameLoot } from "../models/gameLoot.model";
import { ILoot } from "../models/loot.model";

export class GameService {
  protected _game: IGame;
  protected _player: IPlayer;
  protected _Enemies: IEnemy[] = [];
  protected _Loot: ILoot[] = [];

  constructor(game: IGame, player: IPlayer) {
      this._game = game;
      this._game.playerId = player.id;
      this._player = player;
  }

  startNewGame(player: IPlayer) : IGame {
    this._game.date = new Date();
    this._game.score = 0;
    this._game.playerId = player.id;
    this._player = player;
    this._Enemies = [];
    this._Loot = [];

    return this._game;
  }

  get game() : IGame {
    return this._game;
  }

  get player() : IPlayer {
    return this._player;
  }

  //#region Enemies
  get enemies() : IEnemy[] {
    return this._Enemies;
  }

  get gameEnemies() : IGameEnemy[] {
    return this._Enemies.map(enemy => (
      { gameId: this._game.id, enemyId: enemy.id }));
  }

  addEnemy(enemy: IEnemy) {
    this._Enemies.push(enemy);
  }

  clearEnemies() {
    this._Enemies = [];
  }
  //#endregion

  //#region Loot
  get loot() : ILoot[] {
    return this._Loot;
  }

  get gameLoot() : IGameLoot[] {
    return this._Loot.map(loot => (
      { gameId: this._game.id, lootId: loot.id }));
  }

  addLoot(loot: ILoot) {
    this._Loot.push(loot);
  }

  clearLoot() {
    this._Loot = [];
  }
  //#endregion
}

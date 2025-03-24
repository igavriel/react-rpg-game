import { ColorLogger } from "../../utilities/colorLogger";
import { MonsterGenerator } from "../../utilities/monsterGenerator";
import { PlayerGenerator } from "../../utilities/playerGenerator";
import { RandomGenerator } from "../../utilities/randomGenerator";
import { LootGenerator } from "../../utilities/lootGenerator";
import { IEnemy, EnemyFileModel } from "../models/enemy.model";
import { IPlayer, PlayerFileModel } from "../models/player.model";
import { ILoot, LootFileModel } from "../models/loot.model";
import { EnemyService } from "../services/enemy.service";
import { PlayerService } from "../services/player.service";
import { CharacterService } from "../services/character.service";

class GameManager {
  private player: IPlayer | null;
  private playerLoots: ILoot[];
  private monsterLoots: ILoot[];
  private monsters: IEnemy[];
  private deadMonsters: IEnemy[];
  private roundGenerator: RandomGenerator;
  private message: string;

  constructor() {
    this.player = null;
    this.monsters = [];
    this.monsterLoots = [];
    this.playerLoots = [];
    this.deadMonsters = [];
    this.roundGenerator = new RandomGenerator();
    this.message = "";
  }

  private getStatus(character: CharacterService) : string {
    if (character instanceof PlayerService) {
      let player = character as PlayerService;
      return `Level-${player.character.level}: Health: ${player.character.health}, Power:${player.character.attackPower} Exp: ${player.experience}/${player.levelUpExperience}`;
    } else {
      return `Level-${character.character.level}: Health: ${character.character.health}, Power:${character.character.attackPower}`;
    }
  }

  private printIntroduction() {
    console.warn(`Welcome ${this.player?.name}!`);
    console.info(`You are a level ${this.player?.level} with ${this.player?.health} health and ${this.player?.attackPower} attack power.`);
    console.info(`You have ${this.player?.experience}/${this.player?.levelUpExperience} experience points.`);
  }

  private printEndGame(player: PlayerService) {
    if (player.isAlive()) {
      console.warn("You are Alive!");
    } else {
      console.error("You are dead!");
    }
    this.printLoot(player);
    this.printDeadMonsters();
  }

  private printLoot(player: PlayerService) {
    console.info(`You looted ${this.playerLoots.length} items:`);
    let totalValue = 0;
    for (let i = 0; i < this.playerLoots.length; i++) {
      console.info(`* ${this.playerLoots[i].name} worth ${this.playerLoots[i].value}.`);
      totalValue += this.playerLoots[i].value;
    }
    console.warn(`You ended with ${player.experience} experience points and ${totalValue} gold.`);
  }

  public printDeadMonsters() {
    console.warn(`You killed ${this.deadMonsters.length} monsters:`);
    for (let i = 0; i < this.deadMonsters.length; i++) {
      console.info(`* ${this.deadMonsters[i].name} (Level ${this.deadMonsters[i].level})`);
    }
  }

  public gameLoop() {
    this.generatePlayer();
    this.generateMonsters();
    this.printIntroduction();

    if (this.player) {
      let playerService = new PlayerService(this.player);
      for (let i = 0; i < this.monsters.length; i++) {

        let monster = new EnemyService(this.monsters[i],this.monsterLoots[i]);
        while (playerService.isAlive() && monster.isAlive()) {
          this.message = `[Round-${i + 1}] Player ${this.getStatus(playerService)} vs Monster: ${this.getStatus(monster)} `;
          this.playRound(playerService, monster);
        }
      }
      this.printEndGame(playerService);
    }
  }

  private generatePlayer() {
    let generator = new PlayerGenerator();
    this.player = generator.generatePlayer();
  }

  private generateMonsters() {
    let monsterGenerator = new MonsterGenerator();
    let lootGenerator = new LootGenerator();

    for (let i = 0; i < 10; i++) {
      let loot = lootGenerator.generateLoot(1);
      const monster = monsterGenerator.generateMonster(loot.id);
      loot.value = Math.ceil(monster.attackPower / 10);
      this.monsterLoots.push(loot);
      this.monsters.push(monster);
    }
  }

  private playRound(player: PlayerService, monster: EnemyService) : boolean {
    if (!this.player) {
      ColorLogger.error("No player found");
      return false;
    }

    let randomNumber = this.roundGenerator.getRandomNumber(1, 3);
    switch (randomNumber) {
      case 1:
        this.message += "Attack! ";
        console.log(this.message);
        player.attack(monster);
        break;
      case 2:
        this.message += "Defend! ";
        console.log(this.message);
        player.defend(monster.character.attackPower);
        break;
      case 3:
        this.message += "Escape! ";
        console.log(this.message);
        player.escape(monster.character.attackPower);
        break;
    }
    // If the enemy is dead, add the loot to the player's loot and print a message
    if (!monster.isAlive()) {
      player.gainExperience(monster.character.level * 10);
      let loot = this.monsterLoots.find(x => x.id === monster.loot.id);
      if (loot) {
        this.playerLoots.push(loot);
        ColorLogger.warn(`You looted ${loot.name} worth ${loot.value}.`);
      }
      this.deadMonsters.push(monster.enemy);
    }
    return player.isAlive();
  }

  public saveGame() {
    if (this.player) {
      let playerModel = new PlayerFileModel();
      playerModel.save([this.player]);
    }

    let enemyModel = new EnemyFileModel();
    enemyModel.save(this.monsters);

    let lootModel = new LootFileModel();
    lootModel.save(this.playerLoots);
    //lootModel.save(this.monsterLoots);
  }
}

let gm = new GameManager();
gm.gameLoop();
gm.saveGame();

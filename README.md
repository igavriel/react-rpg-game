# react-rpg-game
RPG Game - implemented in TypeScript and React (FE and BE)

A simple console-based game in TypeScript using OOP with inheritance:

### **Game Concept:**  
A **text-based RPG battle simulator** where a player can fight different types of enemies.
The game will have a **turn-based** battle system where a player fights different enemies.

## **1. Game Setup**
The game will run in the console, and the player will be able to interact using keyboard inputs (`readline` in Node.js).  

### **Classes and Their Roles:**
1. **`Character` (Base Class)**  
   - Defines common properties and behaviors for both `Player` and `Enemy`.
2. **`Player` (Extends `Character`)**  
   - Has experience and leveling system.
3. **`Enemy` (Extends `Character`)**  
   - Can drop loot when defeated.
4. **`GameManager` (Manages the gameplay loop)**  
   - Handles user input and battle turns.
5. **`Score` (Manages the gameplay score)**  
   - Handles user score and inventory.

## **2. Game Flow (How the Game Works)**
1. The game starts, and the player is created with default health and attack power.
2. The game presents an enemy.
3. The player chooses an action:
   - `1. Attack`
   - `2. Defend (reduce incoming damage)`
   - `3. Run (escape the fight using luck)`
4. The enemy takes a turn (attacks the player).
5. The game continues until the enemy is defeated or the player dies.
6. If the player wins, they gain experience and level up.
7. The game loops with a new enemy until the player quits or dies.

## **3. Implementing Console Input & Output**
To read player input in a **Node.js environment**, we use **`readline`**.

Example snippet for handling console input:
```typescript
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}
```
We use `askQuestion()` to get player input asynchronously.

## **4. Battle System (Example Turn-Based Flow)**
1. Display Player and Enemy stats.
2. Ask the player to choose an action (`attack`, `defend`, or `run`).
3. Perform the action and update health.
4. Enemy takes a turn (random attack).
5. Repeat until either the player or the enemy is defeated.

### **Class Definitions:**  

1. **`Character` (Base Class)**
   - Properties: `name`, `health`, `attackPower`
   - Methods: `attack(target: Character)`, `takeDamage(amount: number)`

2. **`Player` (Derived Class)**
   - Inherits from `Character`
   - Additional Properties: `level`, `experience`
   - Additional Methods: `gainExperience(amount: number)`

3. **`Enemy` (Derived Class)**
   - Inherits from `Character`
   - Additional Properties: `loot`
   - Additional Methods: `dropLoot()`

4. **`Game` (Main Class)**
   - Manages player and enemy interactions
   - Handles turns, battle logic, and game flow

5. **`Score` (Manage player score and inventory)**
   - Manage player's defeated enemies
   - Manage player inventory and collected loots


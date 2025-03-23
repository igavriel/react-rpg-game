### **📌 REST API Definition for the Game Server**  

The game server will expose a set of **REST API endpoints** for managing the player, game sessions, battles, and game progress. Below is the API definition.

---

### **📍 1. Player Management**
#### **Create a New Player**
- **Endpoint:** `POST /player`
- **Request Body:**
  ```json
  {
    "name": "HeroName"
  }
  ```
- **Response:**
  ```json
  {
    "playerId": "12345",
    "name": "HeroName",
    "level": 1,
    "experience": 0,
    "health": 100,
    "luck": 0.5
  }
  ```

---

### **📍 2. Game Management**
#### **Create a New Game**
- **Endpoint:** `POST /game`
- **Request Body:**
  ```json
  {
    "playerId": "12345",
    "monsters": 3
  }
  ```
- **Response:**
  ```json
  {
    "gameId": "game_67890",
    "playerId": "12345",
    "monsters": [
      { "id": "m1", "type": "Goblin", "level": 2, "health": 50 },
      { "id": "m2", "type": "Orc", "level": 3, "health": 80 },
      { "id": "m3", "type": "Troll", "level": 5, "health": 120 }
    ],
    "status": "active"
  }
  ```

#### **Start Playing the Game**
- **Endpoint:** `POST /game/play`
- **Request Body:**
  ```json
  {
    "gameId": "game_67890"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Game started",
    "status": "active"
  }
  ```

#### **End Game**
- **Endpoint:** `POST /game/end`
- **Request Body:**
  ```json
  {
    "gameId": "game_67890"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Game ended",
    "finalScore": 150,
    "collectedLoot": ["Sword", "Health Potion"]
  }
  ```

---

### **📍 3. Gameplay Actions**
#### **Play One Round**
- **Endpoint:** `POST /game/round`
- **Request Body:**
  ```json
  {
    "gameId": "game_67890",
    "action": "fight"  // Options: "fight", "defend", "escape"
  }
  ```
- **Response Example (Fight Result):**
  ```json
  {
    "playerHealth": 85,
    "enemyHealth": 0,
    "xpGained": 50,
    "message": "You defeated the Goblin and gained 50 XP!"
  }
  ```
- **Response Example (Escape Failed):**
  ```json
  {
    "playerHealth": 60,
    "message": "Escape failed! The enemy attacked you for 15 damage."
  }
  ```

---

### **📍 4. Game Status**
#### **Get Player & Game Status**
- **Endpoint:** `GET /game/status`
- **Query Params:** `?gameId=game_67890`
- **Response:**
  ```json
  {
    "player": {
      "name": "HeroName",
      "level": 2,
      "health": 80,
      "experience": 150
    },
    "monsters": [
      { "id": "m2", "type": "Orc", "level": 3, "health": 40 },
      { "id": "m3", "type": "Troll", "level": 5, "health": 120 }
    ],
    "collectedLoot": ["Iron Shield"]
  }
  ```

---

### **📍 5. Additional Endpoints (Optional)**
#### **Get Scoreboard**
- **Endpoint:** `GET /scoreboard`
- **Response:**
  ```json
  {
    "topPlayers": [
      { "name": "Player1", "score": 500 },
      { "name": "Player2", "score": 450 }
    ]
  }
  ```

---

### **🛠 Next Steps**
Would you like me to generate:
1. **A working Express server with TypeScript** implementing these endpoints?  
2. **Database structure** for storing players, games, and scores?  

Let me know how you'd like to proceed! 🚀
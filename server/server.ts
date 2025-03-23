import express, { Request, Response, RequestHandler } from "express";
import bodyParser from "body-parser";
import { PlayerGenerator } from "../utilities/playerGenerator";
import { MonsterGenerator } from "../utilities/monsterGenerator";

const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory storage for now
let players: any[] = [];
let games: any[] = [];

// Create a new player
app.post("/player", (req, res) => {
  const { name } = req.body;
  let generator = new PlayerGenerator();
  const newPlayer = generator.generatePlayer();
  newPlayer.name = name;
  players.push(newPlayer);
  res.json(newPlayer);
});
/*
// Create a new game
app.post("/game", (req, res) => {
  const { monsters } = req.body;
  const count : number = Number.parseInt(monsters);
  let generator = new MonsterGenerator();
  let array = [];
  for (let i = 0; i < count; i++) {
    array.push(generator.generateMonster());
  }
  const sortedArray = array.sort((a, b) => a.level - b.level);

  const newGame = {
    gameId: Date.now().toString(),
    playerId,
    monsters: Array.from({ length: monsters }, (_, i) => ({
      id: `m${i + 1}`,
      type: "RandomMonster",
      level: Math.floor(Math.random() * 5) + 1,
      health: Math.floor(Math.random() * 100) + 50,
    })),
    status: "active",
  };
  games.push(newGame);
  res.json(newGame);
});

// Start playing the game
app.post("/game/play", ((req: Request, res: Response) => {
  const { gameId } = req.body;
  const game = games.find((g) => g.gameId === gameId);
  if (!game)
    return res.status(404).json({ message: "Game not found" });
  res.json({ message: "Game started", status: "active" });
}) as RequestHandler);

// End game
app.post("/game/end", ((req: Request, res: Response) => {
  const { gameId } = req.body;
  const gameIndex = games.findIndex((g) => g.gameId === gameId);
  if (gameIndex === -1)
    return res.status(404).json({ message: "Game not found" });

  const finalGame = games.splice(gameIndex, 1)[0];
  res.json({
    message: "Game ended",
    finalScore: Math.floor(Math.random() * 500),
    collectedLoot: ["Sword", "Shield"],
  });
}) as RequestHandler);

// Get game status
app.get("/game/status", ((req: Request, res: Response) => {
  const { gameId } = req.query;
  const game = games.find((g) => g.gameId === gameId);
  if (!game) return res.status(404).json({ message: "Game not found" });
  res.json(game);
}) as RequestHandler);
*/
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

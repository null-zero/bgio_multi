const { Server, Origins } = require("boardgame.io/server");
const { TicTacToe } = require("./Game");

const server = Server({
    games: [TicTacToe],
    origins: [Origins.LOCALHOST],
});

const lobbyConfig = {
    apiPort: 8080,
    apiCallback: () => console.log("Running Lobby API on port 8080..."),
};

// server.run(8000, () => console.log(`Server running...`));
server.run({ port: 8000, lobbyConfig });
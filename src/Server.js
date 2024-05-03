const { Server, Origins } = require("boardgame.io/server");
const { Dominion } = require("./Game");


// declare server options
const server = Server({
    games: [Dominion],
    origins: [Origins.LOCALHOST],
});


// declare lobby config (limited due to not having the full lobby system implemented)
const lobbyConfig = {
    apiPort: 8080,
    apiCallback: () => console.log("Running Lobby API on port 8080..."),
};

// server.run(8000, () => console.log(`Server running...`));
server.run({ port: 8000, lobbyConfig });
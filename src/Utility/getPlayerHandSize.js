export function getPlayerHandSize({ G, playerID }) {
    let playerHandCounts = {};
    G.players.forEach( (player)=> {
        playerHandCounts[player.id] = player.hand.length;
    });
    return playerHandCounts;
}

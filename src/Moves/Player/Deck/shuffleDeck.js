export function shuffleDeck({ G, playerID, random }) {
    return random.Shuffle(G.secret.players[playerID].deck);
}
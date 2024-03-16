import { drawCard } from './drawCard';
import { shuffleDeck } from './shuffleDeck';

export function drawHand({ G, playerID, events, random }) {
    if (
        Math.abs(5 - G.players[playerID].hand.length) >
        G.secret.players[playerID].deck.length
    ) {
        G.secret.players[playerID].deck = G.secret.players[
            playerID
        ].deck.concat(G.players[playerID].discard);
        G.secret.players[playerID].deck = shuffleDeck({ G, playerID, random });
        G.players[playerID].discard = [];
    }
    while (G.players[playerID].hand.length < 5) {
        drawCard({ G, playerID });
    }
    
    events.endTurn();
}
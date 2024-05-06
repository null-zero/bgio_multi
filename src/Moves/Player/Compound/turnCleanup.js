import { INVALID_MOVE } from 'boardgame.io/core';
import { discard } from '../Hand/discard';
import { drawHand } from '../Deck/drawHand';
import { shuffleDeck } from '../Deck/shuffleDeck';

export function turnCleanup({ G, playerID, events, random }) {
    
        // discard all selected cards from hand
        for (let i = G.players[playerID].hand.length - 1; i >= 0; i--) {
            discard({ G, playerID }, i);
        };
    
        // reset selection values
        G.players[playerID].shopSelection = null;
        G.players[playerID].handSelection = {};
        G.players[playerID].selectionValue = 0;
    
        // check if deck has enough cards to draw a new hand, shuffle discard into deck if not
        if (5 > G.secret.players[playerID].deck.length) {
            G.secret.players[playerID].deck = G.secret.players[playerID].deck.concat(G.players[playerID].discard);
            G.secret.players[playerID].deck = shuffleDeck({ G, playerID, random });
            G.players[playerID].discard = [];
        }

        // draw new hand
        drawHand({  G, playerID, events, random });
    
}


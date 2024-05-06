import { INVALID_MOVE } from 'boardgame.io/core';
import { discard } from './discard';

export function discardHand({ G, playerID }) {

    // discard all selected cards from hand
    for (let i = G.players[playerID].hand.length - 1; i >= 0; i--) {
        discard({ G, playerID }, i);
    };

    // reset selection values
    G.players[playerID].shopSelection = null;
    G.players[playerID].handSelection = {};
    G.players[playerID].selectionValue = 0;
}
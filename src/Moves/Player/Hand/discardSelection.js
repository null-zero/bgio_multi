import { INVALID_MOVE } from 'boardgame.io/core';
import { discard } from './discard';

export function discardSelection({ G, playerID }, selection) {
    if (selection == undefined || selection == null) {
        return INVALID_MOVE;
    }

    // discard all selected cards from hand
    for (let i = G.players[playerID].hand.length - 1; i >= 0; i--) {
        if (G.players[playerID].handSelection[i] != undefined || G.players[playerID].action[i] !== undefined) {
            discard({ G, playerID }, i);
        }
    };

    // reset selection values
    G.players[playerID].shopSelection = null;
    G.players[playerID].handSelection = {};
    G.players[playerID].selectionValue = 0;
}
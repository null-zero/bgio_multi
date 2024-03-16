import { INVALID_MOVE } from 'boardgame.io/core';
import { discard } from './discard';

export function discardSelection({ G, playerID }, selection) {
    if (selection == undefined || selection == null) {
        return INVALID_MOVE;
    }

    /*
    *  Get all { playerHandIndex: cardName } items from players handSelection
    *  Convert to array so that we can iterate with foreach
    *  Reverse the array so that we can remove items from the hand without changing the index of the other items
    *  Add the card to the discard pile
    *  Remove the card from the hand
    */
    Object.entries(G.players[playerID].handSelection).slice().reverse().forEach(([index, card]) => {
            discard({ G, playerID }, G.players[playerID].hand.splice(index, 1)[0]);
        }
    );

    G.players[playerID].shopSelection = null;
    G.players[playerID].handSelection = {};
    G.players[playerID].selectionValue = 0;
}
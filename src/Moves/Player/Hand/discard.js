import { INVALID_MOVE } from 'boardgame.io/core';

export function discard({ G, playerID }, card) {
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }
    G.players[playerID]["discard"].push(G.players[playerID]["hand"].pop(card));
}
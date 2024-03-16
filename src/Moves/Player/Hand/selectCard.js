import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from '../../../Objs/Cards';

export function selectCard({ G, ctx, playerID }, action, index) {
    if ( index == undefined || index == null) {
        return INVALID_MOVE;
    }

    let card = cards[G.players[playerID].hand[index]];
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    switch (action) {
        case "buy":
            if (!card.type.includes("treasure")) {
                return INVALID_MOVE;
            }
            G.players[playerID].handSelection[index] = card.name;
            G.players[playerID].selectionValue += card.coins;
            break;
        case "playerHandSelection":
            G.players[playerID].handSelection[index] = card.name;
            break;
    };
    //ctx.numMoves--;
}
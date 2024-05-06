import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from '../../../Objs/Cards';

export function selectCard({ G, ctx, playerID }, action, index) {
    // empty function call
    if ( index == undefined || index == null) {
        return INVALID_MOVE;
    }

    // get server card object
    let card = cards[G.players[playerID].hand[index]];
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    switch (action) {
        // if current action is to buy a card, check if the card is a resource card
        case "buy":
            if (G.players[playerID].shopSelection == null) {
                return INVALID_MOVE;
            }

            if (!card.type.includes("resource")) {
                return INVALID_MOVE;
            }
            G.players[playerID].handSelection[index] = card.id;
            G.players[playerID].selectionValue += card.coins;
            break;
        // if current action is to select a card to discard, check if the card is an action card
        case "playerHandSelection":
            G.players[playerID].handSelection[index] = card.id;
            break;
    };
    //ctx.numMoves--;
}
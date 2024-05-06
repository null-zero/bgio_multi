import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from '../../../Objs/Cards';

export function discard({ G, playerID }, cardIndex) {

    let card = cards[G.players[playerID]["hand"][cardIndex]];

    if (card.id == undefined || card.id == null) {
        return INVALID_MOVE;
    }

    G.players[playerID]["discard"].push(card.id);
    G.players[playerID]["hand"] = G.players[playerID]["hand"].filter((card, index) => index != cardIndex);
}
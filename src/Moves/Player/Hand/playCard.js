import { INVALID_MOVE } from 'boardgame.io/core';
import * as cardActions from "../../../CardActions/Actions";
import { cards } from "../../../Objs/Cards";

export function playCard({ G, playerID, events }, card) {
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    let _card = cards[G.players[playerID].hand[card]];

    if (_card == undefined || _card == null) {
        return INVALID_MOVE;
    }
    if (!_card.type.includes("action")) {
        return INVALID_MOVE;
    }

    G.players[playerID].action["playerHandIndex"] = card;
    G.players[playerID].action["name"] = _card.name;

    let actions = _card.actions;
    let _cards = _card.cards;
    let buys = _card.buys;
    let coins = _card.coins;
    G.players[playerID].actions += actions !== undefined ? actions : 0;
    G.players[playerID].buys += buys !== undefined ? buys : 0;
    G.players[playerID].buyingPower += coins !== undefined ? coins : 0;
    // G.players[playerID].discard.push(G.players[playerID].hand.splice(card, 1)[0]);


    cardActions.Action({ G, playerID, events }, _card.name);
};
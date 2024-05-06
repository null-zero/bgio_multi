import { INVALID_MOVE } from 'boardgame.io/core';
import * as cardActions from "../../../CardActions/Actions";
import { cards } from "../../../Objs/Cards";
import { drawCard } from '../Deck/drawCard';
import { discard } from './discard';

export function playCard({ G, playerID, events }, card) {
    // check if requested card is valid
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    console.log(card)
    console.log(G.players[playerID].hand[card])
    // get server card object
    let _card = cards[G.players[playerID].hand[card]];
    console.log(_card)

    // not necessary, but just in case, check if card is valid
    if (_card == undefined || _card == null) {
        return INVALID_MOVE;
    }

    // check if card is an action card
    if (!_card.type.includes("action")) {
        return INVALID_MOVE;
    }

    // set player action to the card being played
    // used for client side to allow for card specific actions
    G.players[playerID].action["playerHandIndex"] = card;
    G.players[playerID].action["name"] = _card.id;

    // add the cards actions, draws, buys, and coins to the players stats
    let actions = _card.actions;
    let draws = _card.cards;
    let buys = _card.buys;
    let coins = _card.coins;
    G.players[playerID].actions += actions !== undefined ? actions : 0;
    G.players[playerID].buys += buys !== undefined ? buys : 0;
    G.players[playerID].buyingPower += coins !== undefined ? coins : 0;
    for (let i = 0; i < (draws !== undefined ? draws : 0); i++) {
        drawCard({ G, playerID });
    }
    // G.players[playerID].discard.push(G.players[playerID].hand.splice(card, 1)[0]);

    console.log('-------------------')
    console.log('pre res')
    console.log(G.players[playerID].hand)
    console.log(G.players[playerID].hand.length)
    console.log('-------------------')
    let actionRes = cardActions.Action({ G, playerID, events }, _card.id);
    if (actionRes) {
        discard({ G, playerID }, G.players[playerID].action.playerHandIndex);
        G.players[playerID].action = {};
        G.players[playerID].actions--;
    }
    console.log('-------------------')
    console.log('post res')
    console.log(G.players[playerID].hand)
    console.log(G.players[playerID].hand.length)
    console.log('-------------------')



    console.log('-------------------')
    console.log('card count')
                 /* calculates the next stage based on the number of action cards in the player's hand */
    let actionCardCount = 0;
    G.players[playerID].hand.forEach((card) => {
        let _card = cards[card];
        console.log(_card)
        if (_card.type == "action") {
            actionCardCount++;
        }
    })
    console.log('-------------------')

    console.log(`actionCardCount: ${actionCardCount}`)
    console.log(`actions: ${G.players[playerID].actions}`)
    if (actionCardCount < 1 || G.players[playerID].actions < 1) {
        events.setStage("buy");
        console.log(`setStage: buy`)
    } 
};
import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from '../../Objs/Cards';
import { discardSelection } from '../Player/Hand/discardSelection';

export function buyCard({ G, playerID, events }) {
    // get players selected collateral cards
    let selection = G.players[playerID].handSelection;
    if (selection == undefined || selection == null) {
        return INVALID_MOVE;
    }

    // get the combined value of the selected cards
    let selectionValue = 0;
    Object.values(selection).forEach((card) => {
        selectionValue += cards[card].coins;
    });

    // check if the selected cards value is less than the cost of the card
    // we don't check exact values as players can buy cards less than their buying power
    if (selectionValue < cards[G.players[playerID].shopSelection].cost) {
        return INVALID_MOVE;
    }

    // add the purchased card to the players discard pile
    // decrement the players buys and buying power
    G.players[playerID].discard.push(G.players[playerID].shopSelection);
    G.players[playerID].buys--;
    G.players[playerID].buyingPower -= cards[G.players[playerID].shopSelection].cost;

    // discard all selected cards from hand
    discardSelection({ G, playerID }, selection);

    // check if player has any buys left
    if (G.players[playerID].buys < 1) {
        events.endStage();
        events.setStage("cleanUp");
    }
}
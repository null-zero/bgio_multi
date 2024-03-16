import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from '../../Objs/Cards';
import { discardSelection } from '../Player/Hand/discardSelection';

export function buyCard({ G, playerID, events }) {
    let selection = G.players[playerID].handSelection;
    
    if (selection == undefined || selection == null) {
        return INVALID_MOVE;
    }

    let selectionValue = 0;
    Object.values(selection).forEach((card) => {
        selectionValue += cards[card].coins;
    });

    if (selectionValue < cards[G.players[playerID].shopSelection].cost) {
        return INVALID_MOVE;
    }

    G.players[playerID].discard.push(G.players[playerID].shopSelection);
    G.players[playerID].buys--;
    G.players[playerID].buyingPower -= cards[G.players[playerID].shopSelection].cost;

    discardSelection({ G, playerID }, selection);
    if (G.players[playerID].buys < 1) {
        events.endStage();
        events.setStage("cleanUp");
    }
}
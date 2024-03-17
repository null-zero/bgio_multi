import { INVALID_MOVE } from "boardgame.io/core";
import { cards } from "../../Objs/Cards";

export function selectPurchase({ G, playerID, events }, card) {
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    if (cards[card] == undefined || cards[card] == null) {
        return INVALID_MOVE;
    }

    if (G.players[playerID].buyingPower < cards[card].cost) {
        return INVALID_MOVE;
    }

    if (G.players[playerID].buys < 1) {
        return INVALID_MOVE;
    }

    G.players[playerID].shopSelection = card;
    // events.setActivePlayers({ currentPlayer: "confirmPurchase" });
}
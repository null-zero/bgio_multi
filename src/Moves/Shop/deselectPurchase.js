import { INVALID_MOVE } from "boardgame.io/core";
import { cards } from "../../Objs/Cards";

export function deselectPurchase({ G, playerID, events }) {

    if (G.players[playerID].shopSelection == undefined || G.players[playerID].shopSelection == null) {
        return INVALID_MOVE;
    }

    G.players[playerID].shopSelection = null;
    G.players[playerID].handSelection = {};
    G.players[playerID].selectionValue = 0;

}
import { cellarAction } from "./Cellar.js";

export function Action({ G, playerID, events }, cardName, bool=false) {

    if (cardName == undefined || cardName == null) {
        cardName = G.players[playerID].action;
    }

    switch (cardName) {
        case "cellar":
            return cellarAction({ G, playerID, events }, bool);
            break;
        default:
            return false;
            break;
    }

    G.players[playerID].action = {};
}
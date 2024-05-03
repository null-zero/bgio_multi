import { cellarAction } from "./Cellar.js";

export function Action({ G, playerID, events }, cardName, bool=false) {

    if (cardName == undefined || cardName == null) {
        cardName = G.players[playerID].action;
    }
    let res = "";
    switch (cardName) {
        case "cellar":
            res = cellarAction({ G, playerID, events }, bool);
            break;
        default:
            res = false;
            break;
    }
    if (bool){
        G.players[playerID].action = {};
    }
    
    return res;
}
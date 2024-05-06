import { cellarAction } from "./Cellar.js";
import { discard } from "../Moves/Moves";

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
            res = true;
            break;
    }
    // if (bool){
    //     discard({ G, playerID }, G.players[playerID].action.playerHandIndex);
    //     G.players[playerID].action = {};
    // }
    
    return res;
}
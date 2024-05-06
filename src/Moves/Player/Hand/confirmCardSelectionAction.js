import * as cardActions from "../../../CardActions/Actions";
import { cards } from "../../../Objs/Cards";

export function confirmCardSelectionAction({ G, playerID, events }) {
    cardActions.Action({ G, playerID, events }, G.players[playerID].action.name, true);

    G.players[playerID].actions--;


    let actionCardCount = 0;
    G.players[playerID].hand.forEach((card) => {
        let _card = cards[card];
        if (_card.type == "action") {
            actionCardCount++;
        }
    })

    if (G.players[playerID].actions < 1 || actionCardCount < 1) {
        events.endStage();
        events.setStage("buy");
    } else {
        events.endStage();
        events.setStage("action");
    }
}
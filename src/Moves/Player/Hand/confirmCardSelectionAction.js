import * as cardActions from "../../../CardActions/Actions";

export function confirmCardSelectionAction({ G, playerID, events }) {
    cardActions.Action({ G, playerID, events }, G.players[playerID].action.name, true);

    G.players[playerID].actions--;
    if (G.players[playerID].actions < 1) {
        events.endStage();
        events.setStage("buy");
    } else {
        events.endStage();
        events.setStage("action");
    }
}
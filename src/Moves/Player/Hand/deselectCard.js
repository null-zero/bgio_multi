import { cards } from "../../../Objs/Cards";
export function deselectCard({ G, ctx, playerID }, action, index) {

    // empty function call
    if (index == undefined || index == null) {
        return INVALID_MOVE;
    }

    // card requested is not in hand
    let card = cards[G.players[playerID].hand[index]];
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    // remove selected card from handSelection and remove the cards value from the players cumulative selectionValue (buying power)
    delete G.players[playerID].handSelection[index];
    G.players[playerID].selectionValue -= card.coins;
}
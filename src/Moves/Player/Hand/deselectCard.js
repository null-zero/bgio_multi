import { cards } from "../../../Objs/Cards";
export function deselectCard({ G, ctx, playerID }, action, index) {
    if (index == undefined || index == null) {
        return INVALID_MOVE;
    }

    let card = cards[G.players[playerID].hand[index]];
    if (card == undefined || card == null) {
        return INVALID_MOVE;
    }

    //ctx.numMoves--;
    delete G.players[playerID].handSelection[index];
    G.players[playerID].selectionValue -= card.coins;
}
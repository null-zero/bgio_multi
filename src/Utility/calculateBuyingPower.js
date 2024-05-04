import { cards } from "../Objs/Cards";

export function calculateBuyingPower({ G, playerID }) {
    let buyingPower = 0;
    if (G.players[playerID].hand.length === 0) return buyingPower;

    G.players[playerID].hand.forEach((card) => {
        if (card == null || card == undefined) return;
        if (cards[card].type.includes("resource")) {
            buyingPower += cards[card].coins;
        }
    });
    return buyingPower;
}

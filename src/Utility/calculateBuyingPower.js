import { cards } from "../Objs/Cards";

export function calculateBuyingPower({ G, playerID }) {
    let buyingPower = 0;
    if (G.players[playerID].hand.length === 0) return buyingPower;
    
    G.players[playerID].hand.forEach((card) => {
        if (cards[card].type.includes("treasure")) {
            buyingPower += cards[card].coins;
        }
    });
    return buyingPower;
}

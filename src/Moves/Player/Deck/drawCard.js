import { calculateBuyingPower } from "../../../Utility/calculateBuyingPower";

export function drawCard({ G, playerID }) {
    G.players[playerID].hand.push(G.secret.players[playerID].deck.pop());
    G.players[playerID].buyingPower = calculateBuyingPower({
        G,
        playerID,
    });
}
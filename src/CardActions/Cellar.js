import { drawCard, discardSelection } from "../Moves/Moves";
import { Dominion } from "../Game";

export function cellarAction({ G, playerID, events }, bool=false) {

    if (!bool) {
        events.setStage("playerHandSelection");
    } else {
        let selection = G.players[playerID].handSelection;
        let discardedCount = Object.keys(selection).length;
    
        if (discardedCount === 0) return
    
        discardSelection({ G, playerID }, selection);
    
        for (let i = 0; i < discardedCount; i++) {
            drawCard({ G, playerID });
            console.log(`drawCard ${i}`);
        }

        G.players[playerID].handSelection = {};
        return {selection, discardedCount};
    }
};
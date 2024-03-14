import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from "./Objs/Cards";
import { startingDeck } from "./Objs/StartingDeck";

export const Dominion = {
    setup: ({ random }) => ({
        secret: {
            players: {
                0: {
                    deck: random.Shuffle(startingDeck()),
                },
                1: {
                    deck: random.Shuffle(startingDeck()),
                },
            },
        },
        players: {
            0: {
                hand: [],
                discard: [],
                buyingPower: 0,
                buys: 1,
                actions: 1,
                shop: {
                    shopSelection: null,
                    shopSelectCards: {},
                },
            },
            1: {
                hand: [],
                discard: [],
                buyingPower: 0,
                buys: 1,
                actions: 1,
                shop: {
                    shopSelection: null,
                    shopSelectCards: {},
                },
            },
        },
    }),
    playerView: PlayerView.STRIP_SECRETS,

    turn: {
        onBegin: ({ G, ctx, events }) => {
            let playerID = ctx.currentPlayer;
            G.players[playerID].buys = 1;

            if (ctx.phase === "main") {
                let newStage = "buy";
                for (const cname of G.players[playerID].hand) {
                    if (cards[cname].type.includes("action")) {
                        newStage = "action";
                        break;
                    }
                }
                if (newStage === "buy") {
                    events.setActivePlayers({ currentPlayer: "buy" });
                    G.players[playerID].buyingPower = calculateBuyingPower({
                        G,
                        playerID,
                    });
                }
                if (newStage === "action") {
                    events.setActivePlayers({ currentPlayer: "action" });
                }
            }
        },
        stages: {
            init: {
                moves: {
                    DrawHand: {
                        move: DrawHand,
                        client: false,
                    },
                },
                minMoves: 1,
                maxMoves: 1,
                start: true,
                next: "action",
            },
            action: ({ G, playerID }) => ({
                minMoves: 0,
                maxMoves: G.players[playerID].actions,
                moves: { playCard },
                next: "selectBuy",
            }),
            selectBuy: ({ G, playerID }) => ({
                minMoves: 0,
                maxMoves: G.players[playerID].buys,
                moves: {
                    selectBuy,
                },
                next: "confirmBuy",
            }),
            confirmBuy: {
                moves: { buyCard, shopSelectCard, shopDeselectCard },
                next: "cleanUp",
            },
            cleanUp: {
                minMoves: 1,
                maxMoves: 1,
                moves: {
                    DrawHand: {
                        move: DrawHand,
                        client: false,
                    },
                },
                next: "action",
            },
        },
    },

    moves: {
        DrawCard,
        DrawHand: {
            move: DrawHand,
            client: false,
        },
        playCard,
        buyCard,
        drawCard: ({ G, playerID }) => {
            G.players[playerID]["hand"].push(G.players[playerID]["deck"].pop());
        },
        shuffleDeck,
    },

    phases: {
        beginning: {
            moves: {
                DrawHand: {
                    move: DrawHand,
                    client: false,
                },
            },
            start: true,
            endIf: ({ G, ctx }) => {
                for (let i = 0; i < ctx.numPlayers; i++) {
                    if (G.players[i].hand.length != 5) {
                        return false;
                    }
                }
                return true;
            },
            next: "main",
        },
        main: {
            moves: {
                DrawHand: {
                    move: DrawHand,
                    client: false,
                },
                DrawCard: {
                    move: DrawCard,
                    client: false,
                },
                selectBuy,
                playCard,
                buyCard,
                discard,
                shopSelectCard,
            },
            next: "end",
        },
        end: {
        },
    },
    
    endIf: ({ G, ctx }) => {
        /* End conditions not implemented yet. Leaving these commented here for reference. */

        // if (IsVictory(G.cells)) {
        //     return { winner: ctx.currentPlayer };
        // }
        // if (IsDraw(G.cells)) {
        //     return { draw: true };
        // }
    },
};

// function IsVictory(cells) {
//     const positions = [
//         [0, 1, 2],
//         [3, 4, 5],
//         [6, 7, 8],
//         [0, 3, 6],
//         [1, 4, 7],
//         [2, 5, 8],
//         [0, 4, 8],
//         [2, 4, 6],
//     ];

//     const isRowComplete = (row) => {
//         const symbols = row.map((i) => cells[i]);
//         return symbols.every((i) => i !== null && i === symbols[0]);
//     };

//     return positions.map(isRowComplete).some((i) => i === true);
// }

function DrawHand({ G, playerID, events, random }) {
    if (
        Math.abs(5 - G.players[playerID].hand.length) >
        G.secret.players[playerID].deck.length
    ) {
        G.secret.players[playerID].deck = G.secret.players[
            playerID
        ].deck.concat(G.players[playerID].discard);
        G.secret.players[playerID].deck = shuffleDeck({ G, playerID, random });
        G.players[playerID].discard = [];
    }
    while (G.players[playerID].hand.length < 5) {
        DrawCard({ G, playerID });
    }
    events.endTurn();
}

function shuffleDeck({ G, playerID, random }) {
    return random.Shuffle(G.secret.players[playerID].deck);
}

function DrawCard({ G, playerID }) {
    G.players[playerID].hand.push(G.secret.players[playerID].deck.pop());
}

function playCard({ G, playerID }, card) {
    if (card === undefined || card === null) {
        return INVALID_MOVE;
    }
    if (!cards[card].type.includes("action")) {
        return INVALID_MOVE;
    }

    let actions = cards[card].actions;
    let cards = cards[card].cards;
    let buys = cards[card].buys;
    let coins = cards[card].coins;

    G.players[playerID].actions += actions;
    G.players[playerID].buys += buys;
    G.players[playerID].buyingPower += coins;

    G.players[playerID].discard.push(G.players[playerID].hand.pop(card));
}

function selectBuy({ G, playerID, events }, card) {
    if (card === undefined || card === null) {
        return INVALID_MOVE;
    }

    if (G.players[playerID].buyingPower < cards[card].cost) {
        return INVALID_MOVE;
    }

    if (G.players[playerID].buys < 1) {
        return INVALID_MOVE;
    }

    G.players[playerID].shop.shopSelection = card;
    events.setActivePlayers({ currentPlayer: "confirmBuy" });
}

function buyCard({ G, playerID, events }) {
    let selection = G.players[playerID].shop.shopSelectCards;
    if (selection === undefined || selection === null) {
        return INVALID_MOVE;
    }

    let selectionValue = 0;
    Object.values(selection).forEach((card) => {
        selectionValue += cards[card].coins;
    });

    if (selectionValue < cards[G.players[playerID].shop.shopSelection].cost) {
        return INVALID_MOVE;
    }

    G.players[playerID]["discard"].push(G.players[playerID].shop.shopSelection);
    G.players[playerID].buys--;
    G.players[playerID].buyingPower -= cards[G.players[playerID].shop.shopSelection].cost;
    discardSelection({ G, playerID }, selection);
    if (G.players[playerID].buys < 1) {
        events.endStage();
    } else {
        events.setActivePlayers({ currentPlayer: "selectBuy" });
    }
}

function calculateBuyingPower({ G, playerID }) {
    let buyingPower = 0;
    G.players[playerID].hand.forEach((card) => {
        if (cards[card].type.includes("treasure")) {
            buyingPower += cards[card].coins;
        }
    });
    return buyingPower;
}

function discard({ G, playerID }, card) {
    if (card === undefined || card === null) {
        return INVALID_MOVE;
    }
    G.players[playerID]["discard"].push(G.players[playerID]["hand"].pop(card));
}

function discardSelection({ G, playerID }, selection) {
    if (selection === undefined || selection === null) {
        return INVALID_MOVE;
    }

    Object.entries(G.players[playerID].shop.shopSelectCards).forEach(
        (index, card) => {
            G.players[playerID]["discard"].push(
                G.players[playerID]["hand"].splice(index, 1)[0]
            );
        }
    );

    G.players[playerID].shop.shopSelection = {};
    G.players[playerID].shop.shopSelectCards = {};
}

function shopSelectCard({ G, ctx, playerID }, index, card) {
    if (
        card === undefined ||
        card === null ||
        index === undefined ||
        index === null
    ) {
        return INVALID_MOVE;
    }
    ctx.numMoves--;
    G.players[playerID].shop.shopSelectCards[index] = card;
}

function shopDeselectCard({ G, ctx, playerID }, index) {
    if (index === undefined || index === null) {
        return INVALID_MOVE;
    }
    ctx.numMoves--;
    delete G.players[playerID].shop.shopSelectCards[index];
}

import { INVALID_MOVE } from 'boardgame.io/core';
import { cards } from "./Objs/Cards";
import { startingDeck } from "./Objs/StartingDeck";
import * as cardActions from "./CardActions/Actions";
import * as Moves from "./Moves/Moves";

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
                actions: 0,
                shopSelection: null,
                selectionValue: 0,
                handSelection: {},
                action: {},
            },
            1: {
                hand: [],
                discard: [],
                buyingPower: 0,
                buys: 1,
                actions: 0,
                shopSelection: null,
                selectionValue: 0,
                handSelection: {},
                action: {},
            },
        },
    }),
    playerView: PlayerView.STRIP_SECRETS,

    turn: {
        activePlayers: { all: "init" , minMoves: 1, maxMoves: 1 },
        onBegin: ({ G, ctx, events }) => {
            let playerID = ctx.currentPlayer;
            G.players[playerID].buys = 1;

            if (ctx.phase === "main") {
                let newStage = "buy";
                for (const cname of G.players[playerID].hand) {
                    if (cards[cname].type.includes("action")) {
                        G.players[playerID].actions = 1;
                        newStage = "action";
                        break;
                    }
                }
                if (newStage === "buy") {
                    events.setActivePlayers({ currentPlayer: "buy" });
                    G.players[playerID].buyingPower = Moves.calculateBuyingPower({
                        G,
                        playerID,
                    });
                }
            }
        },
        stages: {
            init: {
                moves: {
                    drawHand: {
                        move: Moves.drawHand,
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
                moves: { 
                    playCard: {
                        move: Moves.playCard,
                    }
                },
                next: "buy",
            }),
            buy: ({ G, playerID }) => ({
                minMoves: 0,
                maxMoves: G.players[playerID].buys,
                moves: {
                    selectPurchase: {
                        move: Moves.selectPurchase,
                        noLimit: true,
                    },
                    selectCard: {
                        move: Moves.selectCard,
                        noLimit: true,
                    },
                    deselectCard: {
                        move: Moves.deselectCard,
                        noLimit: true,
                    },
                    buyCard: {
                        move: Moves.buyCard,
                    },
                },
                next: "cleanUp",
            }),
            playerHandSelection: {
                minMoves: 1,
                maxMoves: 1,
                moves: {
                    selectCard: {
                        move: Moves.selectCard,
                        noLimit: true,
                    },
                    deselectCard: {
                        move: Moves.deselectCard,
                        noLimit: true,
                    },
                    confirmCardSelectionAction: {
                        move: Moves.confirmCardSelectionAction,
                        client: false,
                    },
                    drawCard: {
                        move: Moves.drawCard,
                        client: false,
                        noLimit: true,
                        optimistic: false,
                    }
                },
                next: "action",
            },
            cleanUp: {
                minMoves: 1,
                maxMoves: 1,
                moves: {
                    drawHand: {
                        move: Moves.drawHand,
                        client: false,
                    },
                },
                next: "action",
            },
        },
    },

    moves: {
        drawCard: {
            move: Moves.drawCard,
            client: false,
        },
        drawHand: {
            move: Moves.drawHand,
            client: false,
        },
        playCard: {
            move: Moves.playCard,
        },
        buyCard: {
            move: Moves.buyCard,
        },
        shuffleDeck: {
            move: Moves.shuffleDeck,
            client: false,
        },
        confirmCardSelectionAction: {
            move: Moves.confirmCardSelectionAction,
            client: false,
        },
    },

    phases: {
        beginning: {
            moves: {
                drawHand: {
                    move: Moves.drawHand,
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
                drawHand: {
                    move: Moves.drawHand,
                    client: false,
                },
                drawCard: {
                    move: Moves.drawCard,
                    client: false,
                },
                selectPurchase: {
                    move: Moves.selectPurchase,
                },
                playCard: {
                    move: Moves.playCard,
                },
                buyCard: {
                    move: Moves.buyCard,
                },
                discard: {
                    move: Moves.discard,
                },
                selectCard: {
                    move: Moves.selectCard,
                    noLimit: true,
                },
                deselectCard: {
                    move: Moves.deselectCard,
                    noLimit: true,
                },
                confirmCardSelectionAction: {
                    move: Moves.confirmCardSelectionAction,
                    client: false,
                },
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

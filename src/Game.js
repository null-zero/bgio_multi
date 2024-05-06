import { INVALID_MOVE, PlayerView,  Stage,  ActivePlayers } from "boardgame.io/core";
import { cards } from "./Objs/Cards";
import { startingDeck } from "./Objs/StartingDeck";
import * as cardActions from "./CardActions/Actions";
import * as Moves from "./Moves/Moves";
import { getPlayerHandSize } from "./Utility/getPlayerHandSize";


/**
 * Represents the Dominion game.
 *
 * @typedef {Object} Dominion
 * @property {function} setup - Initializes the player states and server state.
 * @property {string} playerView - Specifies the player view mode.
 * @property {Object} turn - Contains the logic for each turn.
 * @property {Object} moves - Defines the available moves in the game.
 * @property {Object} phases - Defines the different phases of the game.
 * @property {function} endIf - Specifies the end conditions of the game.
 */
export const Dominion = {

    /* init player states */
    setup: ({ random }) => ({

        /* secret is used to store information that should not be shared with the client */
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

        /* server state */
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
    /* this tells the server to strip all states that were declared in the secret object */
    playerView: PlayerView.STRIP_SECRETS,


    /*  Here comes the mess... */
    
    turn: {
        /* force the player to draw a hand at the beginning of their turn see turn->stages->init */
        activePlayers: { all: "init" , minMoves: 1, maxMoves: 1 },
        playerHandCounts: getPlayerHandSize,


        /* set player state at the beginning of their turn, and check if they have any action cards in their hand
            set their turn stage depending on the results. */
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
                if (newStage === "action") {
                    events.setActivePlayers({ currentPlayer: "action" });
                }
            }
        },
        stages: {
            /* make player draw hand at the beginning of the turn */
            init: {
                moves: {
                    drawHand: {
                        move: Moves.drawHand,
                        client: false, // do this action on the server so the player isn't required to do anything
                    },
                },
                minMoves: 1,
                maxMoves: 1,
                start: true,
                next: "action", // set the next stage
            },

            /* this stage allows players to play action cards */
            action: ({ G, playerID }) => ({
                minMoves: 0,
                maxMoves: G.players[playerID].actions, // limit player to their current max actions
                moves: { 
                    playCard: {
                        move: Moves.playCard,
                        client: false,
                    },
                },
                next: "buy", // set the next stage
            }),

            /* this stage allows players to buy cards */
            buy: ({ G, playerID }) => ({
                minMoves: 0,
                maxMoves: G.players[playerID].buys, // limit player to their current max buys

                /* these moves are client side only, but they allow users to pick cards from the shop and confirm their purchase 
                noLimits are used to bypass the maxMoves property as they are used to chose which card to purchase.*/
                moves: {
                    selectPurchase: {
                        move: Moves.selectPurchase,
                        noLimit: true,
                    },
                    deselectPurchase: {
                        move: Moves.deselectPurchase,
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
                    turnCleanup: {
                        move: Moves.turnCleanup,
                        client: false,
                        noLimit: true,
                    },
                },
                next: "cleanUp",
            }),

            /* this stage allows players to discard their hand and draw a new one (specifically for cards that allow the player to) */
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
                    },
                    
                },
                /* calculates the next stage based on the number of action cards in the player's hand */
                next: ({ G, playerID, ctx }) => {
                    let actionCardCount = 0;
                    G.players[playerID].hand.forEach((card) => {
                        let _card = cards[card];
                        if (_card.type == "action") {
                            actionCardCount++;
                        }
                    })

                    return (actionCardCount > 0 ? "action" : "buy");
                },
            },
            cleanUp: {
                minMoves: 1,
                maxMoves: 1,
                moves: {
                    turnCleanup: {
                        move: Moves.turnCleanup,
                        client: false,
                    }
                },
                next: "action",
            },
        },
    },

    /* define the general available moves in the game, each turn and stage can override this list */
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
            client: false,
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
        turnCleanup: {
            move: Moves.turnCleanup,
            client: false,
            noLimit: true,
        },
    },

    /* defines the different outer phases of the game
        this would basically be where beginning, middle game, and end game phases would be defined */
    phases: {
        /* beginning phase waits for players to connect, and draws their starting hand.
            waits until all players have connected and draws their hand before starting the game */
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

        /* main phase where the game occurs. These are the moves allowed within the main phase, overwrites the overall moves */
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
                deselectPurchase: {
                    move: Moves.deselectPurchase,
                },
                playCard: {
                    move: Moves.playCard,
                    client: false,
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
                turnCleanup: {
                    move: Moves.turnCleanup,
                    client: false,
                    noLimit: true,
                },
            },
            next: "end",
        },
        end: {
        },
    },
    
    /* defines what causes the game to end */
    endIf: ({ G, ctx }) => {
        /* end conditions not implemented yet. Leaving these commented here for reference. */

        // if (Isinfluence(G.cells)) {
        //     return { winner: ctx.currentPlayer };
        // }
        // if (IsDraw(G.cells)) {
        //     return { draw: true };
        // }


        /* original code for endIf */
        // function Isinfluence(cells) {
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
    },
};

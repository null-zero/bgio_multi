import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { Dominion } from "./Game";
import { cards } from "./Objs/Cards";

var currentCtxStage;
var previousCtxStage;
var previousTurn;

function SplashScreen(rootElement) {
    return new Promise((resolve) => {
        const createButton = (playerID) => {
            const button = document.createElement("button");
            button.textContent = "Player " + playerID;
            button.classList =
                "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700";
            button.onclick = () => resolve(playerID);
            rootElement.append(button);
        };
        rootElement.innerHTML = `<p>Play as</p>`;
        const playerIDs = ["0", "1"];
        playerIDs.forEach(createButton);
    });
}

class DominionClient {
    constructor(rootElement, { playerID } = {}) {
        this.client = Client({
            game: Dominion,
            multiplayer: SocketIO({
                server: "localhost:8000",
            }),
            playerID,
            maxPlayers: 2, // SET PLAYER COUNT -> different when using the full lobby system
        });
        this.connected = false;
        this.client.start();
        this.rootElement = rootElement;
        this.client.subscribe((state) => this.update(state));
        console.log(this);
    }

    onConnecting() {
        this.connected = false;
        this.showConnecting();
    }

    onConnected(state) {
        this.connected = true;
        this.drawBackground();
        this.createBoard();
        this.attachListeners();
        if (state.ctx.phase == "beginning") {
            this.client.moves.drawHand();
        }
    }

    showConnecting() {
        this.rootElement.innerHTML = "<p>connecting…</p>";
    }

    drawBackground() {
        this.rootElement.classList.add("bg-orion");
    }
    createBoard() {
        const shopCards = [];
        Object.entries(cards).forEach(([card, attr], index) => {
            if (card == "sabotage") return;
            shopCards.push(createCardEle(card));
        });

        this.rootElement.innerHTML = `
            <h3>Player ${this.client.playerID}</h3>
            <h4>Phase: <span id="phase"></span></h4>
            <h4>Stage: <span id="stage"></span></h4>
            <div class="shopContainer">
            <div class="shop mx-auto grid grid-rows-2 grid-flow-col gap-3">${shopCards.join("")}</div>
            <button class="confirmPlayerHandSelection hidden bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">Confirm</button>
            <div class="shopSelection"></div>
            </div>
            <div id="player">
            <div class="controls"></div>
            <hr class="m-4">
            <div id="hand" class="hand grid gap-3 grid-flow-col w-min"></div>
            <div class="deck"></div>
            </div>
            <p class="winner"></p>
        `;

        this.drawHandEle(this.client.getState());
    }

    drawHandEle(state) {
        const handContainer = this.rootElement.querySelector("#hand");
        const playerHand = [];

        state.G.players[this.client.playerID].hand.forEach((card, index) => {
            playerHand.push(createCardEle(card));
        });

        handContainer.innerHTML = `${playerHand.join("")}`;
        this.attachListeners();
    }

    attachListeners() {
        // Attach event listeners.
        const shopCards = this.rootElement.querySelectorAll(".shop > .card");
        const playerHand = this.rootElement.querySelectorAll("#hand > .card");
        const playerDeck = this.rootElement.querySelector(".deck");
        const shopSelection = this.rootElement.querySelector(".shopSelection");
        const confirmPlayerHandSelection = this.rootElement.querySelector(".confirmPlayerHandSelection");

        // This handler finds the nearest parent with a data-card attribute,
        // and then runs the selectPurchase move on that card.

        const handlePlayerHandClick = (event) => {
            let state = this.client.getState();
            let playerStage = state.ctx.activePlayers[this.client.playerID];
            let playerGameState = state.G.players[this.client.playerID];
            let playerHand = this.rootElement.querySelectorAll("#hand > .card");
            let selectedCard = getCardFromEvent(event);

            if (playerStage == "action") {
                this.client.moves.playCard(selectedCard.playerHandIndex);
                this.drawHandEle(state);
            }


            if (playerStage == "playerHandSelection") {
                if (selectedCard.card.classList.contains("disabled")) return;
            }
            
            if (playerStage == "buy" || playerStage == "playerHandSelection") {

                if (playerGameState.handSelection[selectedCard.playerHandIndex] == undefined) {
                    selectedCard.card.classList.add("selected");
                    this.client.moves.selectCard(playerStage, selectedCard.playerHandIndex);
                } else {
                    selectedCard.card.classList.remove("selected");
                    this.client.moves.deselectCard(playerStage, selectedCard.playerHandIndex);
                }
            }
        };

        const completePurchase = (event) => {
            this.client.moves.buyCard();
        };

        const selectPurchase = (event) => {
            let selectedCard = getCardFromEvent(event);

            this.client.moves.selectPurchase(selectedCard.card.dataset.card);
        };

        const drawCard = (event) => {
            this.client.moves.drawCard();
        };

        const shuffleDeck = (event) => {
            this.client.moves.shuffleDeck();
        };

        const completeDiscard = (event) => {
            this.client.moves.confirmCardSelectionAction();
            console.log("completeDiscard");
        };

        shopCards.forEach((card) => {
            card.onclick = selectPurchase;
        });

        playerHand.forEach((card) => {
            card.onclick = handlePlayerHandClick;
        });


        shopSelection.onclick = completePurchase;

        confirmPlayerHandSelection.onclick = completeDiscard;
    }

    update(state) {
        if (state == null) {
            this.onConnecting();
            return;
        } else if (!this.connected) {
            this.onConnected(state);
        }

        // update phase text
        const phaseEl = this.rootElement.querySelector("#phase");
        phaseEl.textContent = state.ctx.phase;

        // draws players hands once all players have connected and the phase updates to main
        if (state.ctx.phase == "main") {
            this.drawHandEle(state);
        }
        // if (previousTurn == undefined) {
        //     previousTurn = "a";
        // } else {
        //     if (previousTurn !== state.ctx.turn) {
        //         let playersHandSize = this.client.moves.getPlayerHandSize();
        //         console.log(playersHandSize);
        //         previousTurn = state.ctx.turn;
        //     }
        // }
        if (state.ctx.activePlayers != null) {
            // get the current stage of the player from game state
            currentCtxStage = state.ctx.activePlayers[this.client.playerID];

            // janky method of making sure previousStage is defined
            if (previousCtxStage == undefined) {
                previousCtxStage = "a";
            }

            // check if the stage has changed, then updated previous stage and run the appropriate function
            if (
                previousCtxStage !== currentCtxStage &&
                currentCtxStage !== undefined
            ) {
                previousCtxStage = currentCtxStage;

                if (currentCtxStage == "action") {
                    // enable card hover effects if the stage is action
                    this.hoverEffect("#hand > .card", true, "action");
                } else if (currentCtxStage == "cleanUp") {
                    // draw a new hand if the stage is cleanUp
                    this.client.moves.drawHand();
                }
            }

            // check if the stage is not buy or playerHandSelection, then remove the shop blur and pointer events
            if (currentCtxStage != "buy" || currentCtxStage != "playerHandSelection") {
                const shop = this.rootElement.querySelector(".shop");
                let shopSelectionEle = this.rootElement.querySelector(".shopSelection");
                shop.classList.remove("blur-xl", "pointer-events-none");
                shopSelectionEle.innerHTML = "";
                this.hoverEffect("#hand > .card", false);
                this.selectedHandEffect(state, false);
                shopSelectionEle.classList.remove("selected");
                const confirmButton = this.rootElement.querySelector(".confirmPlayerHandSelection");
                confirmButton.classList.add("hidden");
            };

            // check if the stage is buy, then add the shop blur and pointer events
            if (currentCtxStage == "buy") {
                let shopCard = state.G.players[this.client.playerID].shopSelection;
                let shopCollateral = state.G.players[this.client.playerID].handSelection;
                let shopSelectionValue = state.G.players[this.client.playerID].selectionValue;
                let shopSelectionEle = this.rootElement.querySelector(".shopSelection");
                const shop = this.rootElement.querySelector(".shop");

                if (shopCard != null || shopCard != undefined) {
                    shop.classList.add("blur-xl", "pointer-events-none");

                    // add the selected card to the shopSelection element
                    shopSelectionEle.innerHTML = createCardEle(shopCard);
    
                    this.hoverEffect("#hand > .card", true, "resource");
                    this.selectedHandEffect(state);
    
                    // add effect to shop selection if the players accumulative card selection value is enough to buy the card
                    if (shopSelectionValue >= cards[shopCard].cost) {
                        shopSelectionEle.classList.add("selected");
                    } else {
                        shopSelectionEle.classList.remove("selected");
                    }
                }
            };


            if (currentCtxStage == "playerHandSelection") {

                // sets effects for playerHandSelection stage (currently only designed for discarding cards)
                let playerHand = this.rootElement.querySelectorAll("#hand > .card");

                let actionCard = state.G.players[this.client.playerID].action;
                let selectedCard = playerHand[actionCard.playerHandIndex];
                selectedCard.classList.add("disabled");

                let shopCollateral = state.G.players[this.client.playerID].handSelection;
                let shopSelectionValue = state.G.players[this.client.playerID].selectionValue;
                const confirmButton = this.rootElement.querySelector(".confirmPlayerHandSelection");
                const shop = this.rootElement.querySelector(".shop");


                shop.classList.add("blur-xl", "pointer-events-none");

                this.hoverEffect("#hand > .card:not(disabled)", true, "resource");
                this.selectedHandEffect(state);

                confirmButton.classList.remove("hidden");

                let playerHandNotDisabled = this.rootElement.querySelector("#hand > .card:not(disabled)")
                playerHandNotDisabled.classList.add("shift-up");
            }





            // Get the gameover message element.
            const messageEl = this.rootElement.querySelector(".winner");
            if (state.ctx.gameover) {
                // NO GAMEOVER STATES IMPLEMENT YET

                // If the game is over, display the winner.
                messageEl.textContent =
                    state.ctx.gameover.winner !== undefined ?
                        "Winner: " + state.ctx.gameover.winner :
                        "Draw!";
            } else {

                // Display the current player's turn.
                const {currentPlayer} = state.ctx;
                messageEl.textContent = `It’s player ${currentPlayer}’s turn`;
                if (currentPlayer == this.client.playerID) {
                    this.rootElement.classList.add("active");
                } else {
                    this.rootElement.classList.remove("active");
                }
            }
            previousCtxStage = currentCtxStage;
        }
    }

    selectedHandEffect(state, selected=true) {
        let playerHand = this.rootElement.querySelectorAll("#hand > .card");
        let shopCollateral = state.G.players[this.client.playerID].handSelection;

        playerHand.forEach((card, index) => {
            if (card.classList.contains("disabled")) return;

            if (selected && shopCollateral[index] !== undefined){
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        });
    };

    hoverEffect(selector, selected=true, type=null) {
        const parent = this.rootElement.querySelectorAll(selector);
        const classList = ["hover:outline", "hover:outline-offset-2", "hover:outline-pink-500"];
        parent.forEach((child) => {
            if (type == null && !child.dataset.type.includes(type)) return;
            if (child.classList.contains("disabled")) return;
            
            if (selected) {
                child.classList.add(classList[0], classList[1], classList[2]);
            } else {
                child.classList.remove(classList[0], classList[1], classList[2]);
            }
        });
    }
}

function createCardEle(card) {
    let attr = cards[card];
    return `<div class="card select-none" data-card="${card}" data-type="${attr.type}">
    <div class="card-content">
        <div class="card-header">
            ${attr.coins > 0 ? `<div class="card-coins c-left">${attr.coins}</div>`:""}
            <div class="card-name">${attr.name}</div>
            ${attr.coins > 0 ? `<div class="card-coins c-right">${attr.coins}</div>`:""}
            <div class="card-quantity"></div>
        </div>
        <div class="card-image"></div>
        <div class="card-body">
            ${attr.actions>0?`<div class="card-actions">+${attr.actions} Actions</div>`:""}
            ${attr.cards>0?`<div class="card-cards">+${attr.cards} Cards</div>`:""}
            ${attr.buys>0?`<div class="card-buys">+${attr.buys} Buys</div>`:""}
            <div class="card-description">${attr.description}</div>
        </div>
        <div class="card-footer">
            <div class="card-cost">${attr.cost}</div>
            <div class="card-type">${attr.type}</div>
        </div>
    </div>
</div>`;
}

function getCardFromEvent(event) {
    let parent = event.target.parentElement;
    while (parent.dataset.card == undefined) {
        parent = parent.parentElement;
    }
    let index = Array.from(parent.parentElement.children).indexOf(parent);
    // console.log(index, parent);
    return {
        playerHandIndex: index,
        card: parent
    };
}

class App {
    constructor(rootElement) {
        this.client = SplashScreen(rootElement).then((playerID) => {
            return new DominionClient(rootElement, {
                playerID,
            });
        });
    }
}

const appElement = document.getElementById("app");
new App(appElement);
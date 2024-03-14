import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { Dominion } from "./Game";
import { cards } from "./Objs/Cards";

var currentCtxStage;
var previousCtxStage;

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
        rootElement.innerHTML = ` <p>Play as</p>`;
        const playerIDs = ["0", "1"];
        playerIDs.forEach(createButton);
    });
}

class DominionClient {
    constructor(rootElement, { playerID } = {}) {
        this.client = Client({
            game: Dominion,
            multiplayer: SocketIO({ server: "localhost:8000" }),
            playerID,
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
        this.createBoard();
        this.attachListeners();
        if (state.ctx.phase === "beginning") {
            this.client.moves.DrawHand();
        }
    }

    showConnecting() {
        this.rootElement.innerHTML = "<p>connecting…</p>";
    }

    createBoard() {
        const rows = [];
        const cells = [];

        Object.entries(cards).forEach(([card, attr], index) => {
            if (card == "curse") return;
            cells.push(createCardEle(card));
        });
        //rows.push(`<div class="row">${cells.join('')}</div>`);

        this.rootElement.innerHTML = `
            <h3>Player ${this.client.playerID}</h3>
            <h4>Phase: <span id="phase"></span></h4>
            <h4>Stage: <span id="stage"></span></h4>
            <div class="shop grid grid-rows-2 grid-flow-col gap-4 w-min">${cells.join("")}</div>
            <div class="controls"></div>
            <hr class="m-4">
            <div id="hand" class="hand grid gap-4 grid-flow-col w-min"></div>
            <div class="deck"></div>
            <p class="winner"></p>
            <div class="shopSelection"></div>
        `;
    }

    drawHand(state) {
        const hand = this.rootElement.querySelector("#hand");
        const rows = [];
        const cells = [];

        state.G.players[this.client.playerID].hand.forEach((card, index) => {
            cells.push(createCardEle(card));
        });

        hand.innerHTML = `${cells.join("")}`;
    }
    attachListeners() {
        // Attach event listeners to the board cells.
        const cells = this.rootElement.querySelectorAll(".cell");
        const deck = this.rootElement.querySelector(".deck");
        // This handler finds the nearest parent with a data-card attribute,
        // and then runs the selectBuy move on that card.
        const selectBuy = (event) => {
            parent = event.target.parentElement;
            while (parent.dataset.card === undefined) {
                parent = parent.parentElement;
            }
            this.client.moves.selectBuy(parent.dataset.card);
        };

        const drawCard = (event) => {
            this.client.moves.drawCard();
        };
        const shuffleDeck = (event) => {
            this.client.moves.shuffleDeck();
        };

        const drawHand = (event) => {
            this.client.moves.DrawHand();
        };
        cells.forEach((cell) => {
            cell.onclick = selectBuy;
        });

        deck.onclick = drawHand;
    }

    update(state) {
        if (state === null) {
            this.onConnecting();
            return;
        } else if (!this.connected) {
            this.onConnected(state);
        }

        // Get all the board cells.
        const cells = this.rootElement.querySelectorAll(".cell");
        // Update cells to display the values in game state.
        cells.forEach((cell) => {
            const cellId = parseInt(cell.dataset.id, 10);
            const cellValue = state.G.cells[cellId];
            // cell.textContent = cellValue !== null ? cellValue : '';
        });
        const phaseEl = this.rootElement.querySelector("#phase");
        phaseEl.textContent = state.ctx.phase;

        if (state.ctx.phase === "main") {
            this.drawHand(state);
        }

        if (state.ctx.activePlayers != null) {
            currentCtxStage = state.ctx.activePlayers[this.client.playerID];
            if (previousCtxStage == undefined) {
                previousCtxStage = "a";
            }

            if (
                state.ctx.currentPlayer !== this.client.playerID ||
                currentCtxStage !== "confirmBuy" ||
                currentCtxStage !== "action"
            ) {
                const shop = this.rootElement.querySelector(".shop");

                shop.classList.remove("blur-xl");

                const selected = this.rootElement.querySelectorAll(".selected");
                selected.forEach((ele) => {
                    ele.classList.remove("selected");
                    ele.onclick = null;
                });
                const hover =
                    this.rootElement.querySelectorAll(".hover\\:outline");
                hover.forEach((ele) => {
                    ele.classList.remove("hover:outline");
                    ele.classList.remove("hover:outline-offset-2");
                    ele.classList.remove("hover:outline-pink-500");
                    ele.onclick = null;
                });

                let shopSelection =
                    this.rootElement.querySelector(".shopSelection");
                shopSelection.innerHTML = "";
            }

            if (
                previousCtxStage !== currentCtxStage &&
                currentCtxStage !== undefined
            ) {
                previousCtxStage = currentCtxStage;

                if (currentCtxStage === "action") {
                    const hand = this.rootElement.querySelectorAll("#hand > .cell");
                    hand.forEach((card, index) => {
                        if (card.dataset.type.includes("action")) {
                            card.classList.add("hover:outline");
                            card.classList.add("hover:outline-offset-2");
                            card.classList.add("hover:outline-pink-500");

                            card.onclick = (event) => {

                            };
                        }
                    });
                }
                if (currentCtxStage === "confirmBuy") {
                    const shop = this.rootElement.querySelector(".shop");

                    shop.classList.add("blur-xl");

                    let shopSelection =
                        this.rootElement.querySelector(".shopSelection");
                    let shopCard =
                        state.G.players[this.client.playerID].shop
                            .shopSelection;
                    let attr = cards[shopCard];

                    shopSelection.innerHTML = createCardEle(shopCard);

                    const hands =
                        this.rootElement.querySelectorAll("#hand > .cell");
                    let selection = {};
                    let selectionValue = 0;
                    hands.forEach((card, index) => {
                        if (card.dataset.type === "treasure") {
                            card.classList.add("hover:outline");
                            card.classList.add("hover:outline-offset-2");
                            card.classList.add("hover:outline-pink-500");

                            card.onclick = (event) => {
                                if (card.classList.contains("selected")) {
                                    card.classList.remove("selected");
                                    selectionValue -=
                                        cards[
                                            card.querySelector(".card-name")
                                                .textContent
                                        ].coins;
                                    this.client.moves.shopDeselectCard(index);
                                    delete selection[index];
                                } else {
                                    card.classList.add("selected");
                                    selection[index] =
                                        card.querySelector(
                                            ".card-name"
                                        ).textContent;
                                    selectionValue +=
                                        cards[
                                            card.querySelector(".card-name")
                                                .textContent
                                        ].coins;

                                    if (
                                        selectionValue >= cards[shopCard].cost
                                    ) {
                                        shopSelection.classList.add("selected");
                                        shopSelection.onclick = (event) => {
                                            Object.entries(selection).forEach(
                                                ([index, card]) => {
                                                    this.client.moves.shopSelectCard(
                                                        index,
                                                        card
                                                    );
                                                }
                                            );
                                            this.client.moves.buyCard();
                                            this.drawHand(state);
                                        };
                                    }
                                }
                            };
                        }
                    });
                }
            }

            // Get the gameover message element.
            const messageEl = this.rootElement.querySelector(".winner");
            // Update the element to show a winner if any.
            if (state.ctx.gameover) {
                messageEl.textContent =
                    state.ctx.gameover.winner !== undefined
                        ? "Winner: " + state.ctx.gameover.winner
                        : "Draw!";
            } else {
                const { currentPlayer } = state.ctx;
                messageEl.textContent = `It’s player ${currentPlayer}’s turn`;
                if (currentPlayer === this.client.playerID) {
                    this.rootElement.classList.add("active");
                } else {
                    this.rootElement.classList.remove("active");
                }
            }
            previousCtxStage = currentCtxStage;
        }
    }
}

function createCardEle(card) {
    let attr = cards[card];
    return `<div class="cell" data-card="${card}" data-type="${attr.type}">
        <div class="card">
            <div class="card-content">
            <div class="card-header">
            ${attr.coins > 0 ? `<div class="card-coins c-left">${attr.coins}</div>` : ""}
            <div class="card-name">${card}</div>
            ${attr.coins > 0 ? `<div class="card-coins c-right">${attr.coins}</div>` : ""}
            <div class="card-quantity"></div>
        </div>
        <div class="card-image"></div>
        <div class="card-body">
            ${attr.actions > 0 ? `<div class="card-actions">+${attr.actions} Actions</div>` : ""}
            ${attr.cards > 0 ? `<div class="card-cards">+${attr.cards} Cards</div>` : ""}
            ${attr.buys > 0 ? `<div class="card-buys">+${attr.buys} Buys</div>` : ""}
        <div class="card-description">${attr.description}</div>
        </div>
        <div class="card-footer">
            <div class="card-cost">${attr.cost}</div>
            <div class="card-type">${attr.type}</div>
        </div>
        </div>
</div>
</div>`;
}
class App {
    constructor(rootElement) {
        this.client = SplashScreen(rootElement).then((playerID) => {
            return new DominionClient(rootElement, { playerID });
        });
    }
}

const appElement = document.getElementById("app");
new App(appElement);

import { cards } from './Cards.js';
export function startingDeck() {
    let deck = [];
    for (let i = 0; i < 7; i++) {
        deck.push(cards.galactic_ice.name);
    }
    for (let i = 0; i < 3; i++) {
        deck.push(cards.estate.name);
    }
    return deck;
}
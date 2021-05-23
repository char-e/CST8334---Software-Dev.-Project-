/* Import or write your JavaScript code here */
// console.log("Hello, guys!");

var suits = ["heart", "diamond", "spade", "club"];
var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
    var deck = new Array();
	for(var s = 0; s < suits.length; s++) {
		for(var r = 0; r < ranks.length; r++) {
			var card = {Rank: ranks[r], Suit: suits[s]};
			deck.push(card);
	    }
	}
	return deck;
}

// Shuffling the deck randomly
function shuffle(deck) {
	var deckSize = deck.length;
	var randNum, tempCard;

	for (var i = deckSize - 1; i != 0; i--) {
	   // Radnomly selecting a position in the deck
	   randNum = Math.floor(Math.random() * i);

	   // Swapping the location of the cards
	   tempCard = deck[i];
	   deck[i] = deck[randNum];
	   deck[randNum] = tempCard;
	}
	return deck;
}

 d = createDeck();
 console.log(d);
 shuffledDeck = shuffle(d);
 console.log(shuffledDeck);
// document.getElementById('dealbtn').addEventListener('click', createDeck)
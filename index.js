/* Import or write your JavaScript code here */
// console.log("Hello, guys!");

var suits = ["heart", "diamond", "spade", "club"];
var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var isSelected = false;

function createDeck() {
  var deck = new Array();
  for (var s = 0; s < suits.length; s++) {
    for (var r = 0; r < ranks.length; r++) {
      var card = { Rank: ranks[r], Suit: suits[s] };
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
//console.log(d);
shuffledDeck = shuffle(d);
//console.log(shuffledDeck);
// document.getElementById('dealbtn').addEventListener('click', createDeck)

// function to deal cards
function dealCards(stock) {
  for (i = 0; i < 7; i++) {
    for (pile = i; pile < 7; pile++) {
      var card = stock.pop();
      var cardHTML = document.createElement("div");
      cardHTML.setAttribute("class", "card");
      cardHTML.setAttribute("data-rank", card.Rank);
      cardHTML.setAttribute("data-suit", card.Suit);
      document
        .getElementsByClassName("tableau-pile")
        [pile].appendChild(cardHTML);
    }
  }

  for (i = 0; i < stock.length; i++) {
    var cardHTML = document.createElement("div");
    cardHTML.setAttribute("class", "card");
    cardHTML.setAttribute("data-rank", stock[i].Rank);
    cardHTML.setAttribute("data-suit", stock[i].Suit);
    document.getElementsByClassName("stock-pile")[0].appendChild(cardHTML);
  }
  faceUp();
  return stock;
}

// function to turn cards face up
function faceUp() {
  for (i = 0; i < 7; i++) {
    var card = document.getElementsByClassName("tableau-pile")[i].lastChild;
    card.className += " up";
  }
}

dealCards(d);

// add a click event listener to the 'deal' btn
var btn = document
  .getElementById("dealbtn")
  .addEventListener("click", function () {
    clearPiles();
    d = createDeck();
    shuffledDeck = shuffle(d);
    dealCards(d);
  });

// clear stock and tableau piles
function clearPiles() {
  var piles = document.querySelectorAll(".tableau-pile");
  var stockPile = document.querySelector(".stock-pile");
  stockPile.innerHTML = null;
  Array.prototype.forEach.call(piles, function (pile) {
    pile.innerHTML = null;
  });
}

// add a click event listener to the tableau piles
function attachEventListeners() {
  var piles = document.querySelectorAll(".tableau-pile,.foundations-pile");
  Array.prototype.forEach.call(piles, function (pile) {
    pile.addEventListener("click", function () {
      moveCards(pile);
    });
  });
}

// function to move cards
function moveCards(pile) {
  if (!isSelected) {
    var card = pile.lastChild;
    if (card) {
      card.classList.add("selected");
      isSelected = true;
    }
  } else {
    var cardSelected = document.querySelector(".card.selected");
    // find parent pile of the first selected card
    var parentPile = cardSelected.closest(".pile");
    // remove cardSelected from the old parent pile
    parentPile.removeChild(cardSelected);
    // open the last card left in that pile (if any)
    if(parentPile.lastChild) {
      parentPile.lastChild.classList.add("up");
    }
    // add cardSelected to the end of the new pile
    pile.appendChild(cardSelected);
    cardSelected.classList.remove("selected");
    isSelected = false;
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  attachEventListeners();
});

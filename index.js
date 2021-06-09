/* Import or write your JavaScript code here */
// console.log("Hello, guys!");

var suits = ["heart", "diamond", "spade", "club"];
var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var isSelected = false;

d = createDeck();
//console.log(d);
shuffledDeck = shuffle(d);
//console.log(shuffledDeck);
// document.getElementById('dealbtn').addEventListener('click', createDeck)
dealCards(d);

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

// add a click event listener to the 'deal' btn
var btn = document
  .getElementById("dealbtn")
  .addEventListener("click", function () {
    isSelected = false;
    clearPiles();
    d = createDeck();
    shuffledDeck = shuffle(d);
    dealCards(d);
  });

// clear foundations, stock and tableau piles
function clearPiles() {
  var foundations = document.querySelectorAll(".foundations-pile");
  var piles = document.querySelectorAll(".tableau-pile");
  var stockPile = document.querySelector(".stock-pile");
  stockPile.innerHTML = null;
  Array.prototype.forEach.call(piles, function (pile) {
    pile.innerHTML = null;
  });
  Array.prototype.forEach.call(foundations, function (pile) {
    pile.innerHTML = null;
  });
}

// add a click event listener to the tableau piles
function attachEventListeners() {
  var piles = document.querySelectorAll(".tableau-pile,.foundations-pile");
  Array.prototype.forEach.call(piles, function (pile) {
    pile.addEventListener("click", function (event) {
      moveCardToTableau(pile, event);
    });
  });
}

// function to move cards to the tableau
function moveCardToTableau(pile, event) {
  if (!isSelected) {
    // can only select cards from the tableau and talon
    if (
      pile.classList.contains("tableau-pile") ||
      pile.classList.contains("talon-pile")
    ) {
      var card = event.target;
      if (card && card.classList.contains("up")) {
        card.classList.add("selected");
        var cardSiblings = findSiblings(card);
        for (i = 0; i < cardSiblings.length; i++) {
          cardSiblings[i].classList.add("selected");
        }
        isSelected = true;
      }
    }
  } else {
    var cardsSelected = document.querySelectorAll(".card.selected");
    var cardDestination = pile.lastChild;
    // find parent pile of the first selected card
    var parentPile = cardsSelected[0].closest(".tableau-pile");

    var validMove = false;

    if (pile.classList.contains("tableau-pile")) {
      validMove = validTableauMove(cardsSelected[0], cardDestination);
    } else if (pile.classList.contains("foundations-pile")) {
      // Check foundation pile of the correct suit, despite which foundation pile is clicked
      pile = document.querySelector(
        ".pile.foundations-pile." + cardsSelected[0].getAttribute("data-suit")
      );
      cardDestination = pile.lastChild;
      validMove = validFoundationMove(cardsSelected[0], cardDestination);
    } else {
      // invalid move
      // TODO: possible error feedback (red flash/sound, etc)
    }
    if (validMove) {
      // remove cardSelected from the old parent pile
      for (i = 0; i < cardsSelected.length; i++) {
        parentPile.removeChild(cardsSelected[i]);
      }
      // open the last card left in that pile (if any)
      if (parentPile.lastChild) {
        parentPile.lastChild.classList.add("up");
      }
      // add cardSelected to the end of the new pile
      for (i = 0; i < cardsSelected.length; i++) {
        pile.appendChild(cardsSelected[i]);
      }
    }

    // deselect card
    for (i = 0; i < cardsSelected.length; i++) {
      cardsSelected[i].classList.remove("selected");
    }

    isSelected = false;
  }
}

// function to check if a move to the tableau is allowed
function validTableauMove(cardSelected, cardDestination) {
  // if destination is empty, selected card just needs to be a king
  if (!cardDestination) {
    // console.log("Empty destination, must be king");
    return cardSelected.getAttribute("data-rank") == ranks[12];
  }
  // console.log("selected: " + cardSelected.getAttribute("data-rank") + "\ndestination:" + cardDestination.getAttribute("data-rank"));
  // check for descending order
  if (
    ranks.indexOf(cardDestination.getAttribute("data-rank")) !=
    ranks.indexOf(cardSelected.getAttribute("data-rank")) + 1
  ) {
    // console.log("Bad order");
    return false;
  }
  // check for alternating colour
  // if both are red, return false
  if (
    (cardSelected.getAttribute("data-suit") == suits[0] ||
      cardSelected.getAttribute("data-suit") == suits[1]) &&
    (cardDestination.getAttribute("data-suit") == suits[0] ||
      cardDestination.getAttribute("data-suit") == suits[1])
  ) {
    // console.log("Bad suit: both cards red");
    return false;
  }
  // if both are black, return false
  if (
    (cardSelected.getAttribute("data-suit") == suits[2] ||
      cardSelected.getAttribute("data-suit") == suits[3]) &&
    (cardDestination.getAttribute("data-suit") == suits[2] ||
      cardDestination.getAttribute("data-suit") == suits[3])
  ) {
    // console.log("Bad suit: both cards black");
    return false;
  }
  // all checks passed
  // console.log("Valid move");
  return true;
}

// function to check if a move to the foundation is allowed
function validFoundationMove(cardSelected, cardDestination) {
  if (!cardDestination) {
    // console.log("Empty destination, must be ace");
    return cardSelected.getAttribute("data-rank") == ranks[0];
  }
  // check for ascending order
  if (
    ranks.indexOf(cardDestination.getAttribute("data-rank")) !=
    ranks.indexOf(cardSelected.getAttribute("data-rank")) - 1
  ) {
    // console.log("Bad order");
    return false;
  }
  // all checks passed
  // console.log("Valid move");
  return true;
}

// find the selected card siblings
function findSiblings(node) {
  var siblings = [];
  while (node) {
    if (node !== this && node.nodeType === Node.ELEMENT_NODE)
      siblings.push(node);
    node = node.nextElementSibling || node.nextSibling;
  }
  return siblings;
}

window.addEventListener("DOMContentLoaded", (event) => {
  attachEventListeners();
});

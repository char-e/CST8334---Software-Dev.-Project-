/* Import or write your JavaScript code here */
// console.log("Hello, guys!");

const suits = ["heart", "diamond", "spade", "club"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// scoring types
const NORMALSCORING = 0, VEGASSCORING = 1;
// scoring event types
const SCORETABLEAU = 1, SCORETALON = 2, SCOREFOUNDATION = 3, SCOREGAMEOVER = 4, SCORE10S = 5;
var scoreType = NORMALSCORING;
var isSelected = false;
var startTime = new Date().getTime();
var tenSecondScoreTimer = function() {addToScore(SCORE10S);}

d = createDeck();
//console.log(d);
shuffledDeck = shuffle(d);
//console.log(shuffledDeck);
// document.getElementById('dealbtn').addEventListener('click', createDeck)
dealCards(d);
resetScore();

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
    resetScore();
  });

  // Takes resets current score and updates the startTime timestamp
function resetScore() {
  var score = document.querySelector(".score");
  if(scoreType == VEGASSCORING) {
    score.innerHTML = "-52";
  }
  else { // scoreType == NORMALSCORING
    score.innerHTML = "0";
  }
  startTime = new Date().getTime();
  tenSecondScoreTimer = setInterval(tenSecondScoreTimer, 10000);
}

// Alter score by a specific amount based on the score event and scoring type active
//                              Standard    Vegas
// 1: tableau card flipped        5
// 2: card moved from talon       5 
// 3: card moved to foundation    10          5
// 4: game ended                 bonus
// 5: 10s elapsed                 -2
function addToScore(eventType) {
  var amount = 0;
  if(scoreType == NORMALSCORING) {
    switch(eventType) {
      case SCORETABLEAU:
        amount = 5;
        break;
      case SCORETALON:
        amount = 5;
        break;
      case SCOREFOUNDATION:
        amount = 10;
        break;
      case SCOREGAMEOVER:
        // Add [700,000 / (seconds to win the game)] bonus points
        var gameLength = (new Date().getTime() - startTime) / 1000;
        amount = Math.round(700000 / gameLength)
        break;
      case SCORE10S:
        amount = -2;
        break;
      default:
        amount = 0;
    }
  }
  else if(scoreType == VEGASSCORING) {
    switch(eventType) {
      case SCOREFOUNDATION:
        amount = 5;
        break;
      default:
        amount = 0;
    }
  }

  var score = document.querySelector(".score");
  score.innerHTML = Number(score.innerHTML) + amount;
}

function win() {
  addToScore(SCOREGAMEOVER);
  console.log("game length (s): " + gameLength);
}

function checkWin() {
  var foundations = document.querySelectorAll(".foundations-pile");

  for (let i = 0; i < foundations.length; i++) {
    if(!foundations[i].lastChild ||
      foundations[i].lastChild.getAttribute("data-rank") != ranks[12]) {
        // If the top card on any foundation pile is null or not a king, the game is not over!
        return false;
    }
  }
  // all foundations' top card is a king
  return true;
}

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
      // Score 10 points when moving to a foundation
      if(pile.classList.contains("foundations-pile")) {
        addToScore(SCOREFOUNDATION);
      }
      // Score 5 points when moving from the talon pile
      // if(*card is from parent pile*) {
      //   addToScore(SCORETALON);
      // }

      // remove cardSelected from the old parent pile
      for (i = 0; i < cardsSelected.length; i++) {
        parentPile.removeChild(cardsSelected[i]);
      }
      // open the last card left in that pile (if any)
      if (parentPile.lastChild) {
        parentPile.lastChild.classList.add("up");
        // New card turned face up, add 5 to score
        addToScore(SCORETABLEAU);
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

    if(checkWin()) {
      win();
    }
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

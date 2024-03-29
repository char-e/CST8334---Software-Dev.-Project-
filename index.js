/* Import or write your JavaScript code here */
// console.log("Hello, guys!");

const suits = ["heart", "diamond", "spade", "club"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// scoring types
const NORMALSCORING = 0, VEGASSCORING = 1;
// scoring event types
const SCORETABLEAU = 1, SCORETALON = 2, SCOREFOUNDATION = 3, SCOREGAMEOVER = 4, SCORE10S = 5, STOCK = 6;
var scoreType = NORMALSCORING;
var isSelected = false;
var startTime = new Date().getTime();
var scoreTimer;
var scoreTimerFunction = function() {addToScore(SCORE10S);}

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

function dealButtonClicked() {
  isSelected = false;
  clearPiles();
  d = createDeck();
  shuffledDeck = shuffle(d);
  dealCards(d);
  resetScore();
  let talonPile = document.querySelector('.talon-pile'); 
  while (talonPile.hasChildNodes()) { 
      talonPile.removeChild(talonPile.lastChild); 
  }
}

// add a click event listener to the 'deal' btn and vegas scoring toggle
var btn = document
  .getElementById("dealbtn")
  .addEventListener("click", function() {
    dealButtonClicked();
  });
var btn = document
  .getElementById("vegasSwitch")
  .addEventListener("change", function() {
    dealButtonClicked();
  });

// Resets current score and updates the startTime timestamp
function resetScore() {
  var score = document.querySelector(".score");
  var vegasSwitch = document.getElementById("vegasSwitch");
  scoreType = NORMALSCORING;
  if(vegasSwitch.checked) {
    scoreType = VEGASSCORING;
  }
  if(scoreType == VEGASSCORING) {
    score.innerHTML = "-52";
  }
  else { // scoreType == NORMALSCORING
    score.innerHTML = "0";
  }
  startTime = new Date().getTime();
  clearInterval(scoreTimer);
  scoreTimer = setInterval(scoreTimerFunction, 10000);
}

// Alter score by a specific amount based on the score event and scoring type active
//                              Standard    Vegas
// 1: tableau card flipped        5
// 2: card moved from talon       5 
// 3: card moved to foundation    10          5
// 4: game ended                 bonus
// 5: 10s elapsed                 -2
// 6: Stock refresh               -100        lose!
function addToScore(eventType) {
  var amount = 0;
  if(scoreType == NORMALSCORING) {
    switch(eventType) {
      case SCORETABLEAU:
        amount = 5;
        // console.log("+5: Tableau");
        break;
      case SCORETALON:
        amount = 5;
        // console.log("+5: Talon");
        break;
      case SCOREFOUNDATION:
        amount = 10;
        // console.log("+10: Foundation");
        break;
      case SCOREGAMEOVER:
        // Add [700,000 / (seconds to win the game)] bonus points
        var gameLength = (new Date().getTime() - startTime) / 1000;
        amount = Math.round(700000 / gameLength);
        // console.log("+"+amount+": GameOver");
        break;
      case SCORE10S:
        amount = -2;
        // console.log("-2: Timer");
        break;
      case STOCK:
        amount = -100;
        break;
      default:
        // console.log("0: Default");
        amount = 0;
    }
  }
  else if(scoreType == VEGASSCORING) {
    switch(eventType) {
      case SCOREFOUNDATION:
        amount = 5;
        break;
      case STOCK:
        // Lose!
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
  clearInterval(scoreTimer);
  alert("You win!");
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
  var piles = document.querySelectorAll(".foundations-pile");
  Array.prototype.forEach.call(piles, function (pile) {
    pile.addEventListener("click", function (event) {
      moveCardToTableau(pile, event);
    });
  });
}


/////////
/**
 *   STOCK PILE MOVES  
 */

 function attachEventListenersToStock() {
  var piles = document.querySelectorAll(".stock-pile");
  Array.prototype.forEach.call(piles, function (pile) {
    pile.addEventListener("click", function (event) {
      getCardFromStock(pile, event);
    });
  });
}
attachEventListenersToStock();

function getCardFromStock(pile, event){
  clearSelected();
  let stockPile =  document.querySelector('.stock-pile');
  let talonPile =  document.querySelector('.talon-pile');
  let stockPileCard =stockPile.lastChild;
  // console.log(pile, event);
  if(stockPileCard){ //stockPile is not empty
    stockPile.removeChild(stockPileCard);
    if (talonPile.lastChild) {
      talonPile.lastElementChild.classList.remove("selected");
      isSelected = false;
    }
    talonPile.appendChild(stockPileCard);
    stockPileCard.classList.add("up");
  }else if(scoreType == NORMALSCORING){ // stockPile empty
    if(talonPile.hasChildNodes()) {
      addToScore(STOCK);
    }
    //make a button to get every card from talon pile to stack 
    while (talonPile.hasChildNodes()) {
      talonPile.lastChild.classList.remove("up");
      stockPile.appendChild(talonPile.removeChild(talonPile.lastChild));
    }
  } else {
    clearInterval(scoreTimer);
    alert("Game over!");
  }
} 

/**
 *  END STOCK PILE MOVES  
***/


/**
 *   TALON PILE MOVES  
 */

//  function attachEventListenersToTalon() {
//   var piles = document.querySelectorAll(".talon-pile");
//   Array.prototype.forEach.call(piles, function (pile) {
//     pile.addEventListener("click", function (event) {
//       moveCardToTableau(pile, event);
//     });
//   });
// }

// attachEventListenersToTalon();

// function moveCardToTalon(pile, event){
//   console.log('Talon:: pile', pile)
// }


/**
 *   END TALON PILE MOVES  
 */


// function for the double click to move cards to foundation pile
// from tablew or talon  
let clickCount=0;
let singleClickTimer;
function isDoubleClick() {
  clickCount++;
  if (clickCount === 1) {
      singleClickTimer = setTimeout(function() {
      clickCount = 0;
      }, 500);
      return false;
  } else if (clickCount === 2) {
      clearTimeout(singleClickTimer);
      clickCount = 0;
      return true;
  }
  else{
    return false;
  }
}

function attachClickEventListeners() {
  var piles = document.querySelectorAll(".tableau-pile,.talon-pile");
  Array.prototype.forEach.call(piles, function (pile) {
    pile.addEventListener("click", function (event) {
      magicMove(pile, event, isDoubleClick()); 
    });
  });
}
attachClickEventListeners();


// Doubble click pt.2 AKA magicMove
function magicMove(pile, event,isDoubleClicked){

  // Check if the same pile was double clicked
  // This check is required as rapidly clicking two different piles fulfills a 'double click'
  // Run double click logic
  if(isDoubleClicked && pile.lastChild && pile.lastChild.classList.contains("selected")){
    let cardSelected =  event.target;
    let suit = cardSelected.getAttribute("data-suit");
    let foundationsPile = document.querySelector(`.foundations-pile.${suit}`);
    let cardDestination = foundationsPile.lastChild;
    if (validFoundationMove(cardSelected, cardDestination)) {
      if (cardSelected.nextSibling === null) {
        moveTableauToFoundation(cardSelected, foundationsPile); //(destPile, selectedCArd)
        return;
      }
    }
    let tableauPileCollection = document.querySelectorAll(`.tableau-pile`);
    for (let i = 0; i < tableauPileCollection.length; i++) {
      let cardDest = tableauPileCollection[i].lastChild;
      if (validTableauMove(cardSelected, cardDest)) {
        moveCardToTableau(tableauPileCollection[i], cardSelected); //(destPile, selectedCArd)
        break; // Stop searching, card has been moved
      }
    }
    clearSelected();
  }
  else { // Not a double click, run regular click logic
    moveCardToTableau(pile, event);
  }
}

// function isTableauSuitMatch(cardSelected, cardDestination) {

//   if (
//     (cardSelected.getAttribute("data-suit") == suits[0] ||
//       cardSelected.getAttribute("data-suit") == suits[1]) &&
//     (cardDestination.getAttribute("data-suit") == suits[0] ||
//       cardDestination.getAttribute("data-suit") == suits[1])
//   ) {
//     console.log("Bad suit: both cards red");
//     return false;
//   }
//   // if both are black, return false
//   if (
//     (cardSelected.getAttribute("data-suit") == suits[2] ||
//       cardSelected.getAttribute("data-suit") == suits[3]) &&
//     (cardDestination.getAttribute("data-suit") == suits[2] ||
//       cardDestination.getAttribute("data-suit") == suits[3])
//   ) {
//     console.log("Bad suit: both cards black");
//     return false;
//   }

//   return true;
// }


function moveTableauToFoundation(cardSelected, destPile){
  parentPile = cardSelected.closest(".tableau-pile,.talon-pile");
  // console.log("ParentPile",parentPile);
  parentPile.removeChild(cardSelected);
  if(parentPile.classList.contains("talon-pile")) {
    addToScore(SCORETALON);
  }
  if(destPile.classList.contains("foundations-pile")) {
    addToScore(SCOREFOUNDATION);
  }
  if (parentPile.lastChild) {
    if(!parentPile.lastChild.classList.contains("up")) {
      addToScore(SCORETABLEAU);
    }
    parentPile.lastChild.classList.add("up");
  }
  destPile.appendChild(cardSelected);

  clearSelected();

  if(checkWin()) {
    win();
  }
}

/////////

// function to move cards to the tableau
//Main variables pile (current or destination  pile which is clicked), parentPile(pile of card having last child class = selected)
// cardSelected (previously selected card ) cardDestination (destination pile lasT child)
function moveCardToTableau(pile, event) { //tableau pile 
  if (!isSelected) { //isSelected == false
    // can only select cards from the tableau and talon
    if (
      pile.classList.contains("tableau-pile") ||
      pile.classList.contains("talon-pile")
    ) {
      var card = event.target; //card div
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
    var cardsSelected = document.querySelectorAll(".card.selected"); // source find by .selected
    var cardDestination = pile.lastChild; // dest card found by when this card clicked
    // find parent pile of the first selected card
    var parentPile = cardsSelected[0].closest(".tableau-pile,.talon-pile");
    // console.log(cardsSelected, parentPile);
    var validMove = false;

    if (pile.classList.contains("tableau-pile")) {
      validMove = validTableauMove(cardsSelected[0], cardDestination);
    } 
    else if (pile.classList.contains("foundations-pile")) {
      // Check foundation pile of the correct suit, despite which foundation pile is clicked
      pile = document.querySelector(
        ".pile.foundations-pile." + cardsSelected[0].getAttribute("data-suit")
      ); //finding type of suit in pile 
      cardDestination = pile.lastChild;
      validMove = validFoundationMove(cardsSelected[0], cardDestination);
    } else {
      // invalid move
      // console.log('invalid move')
      // TODO: possible error feedback (red flash/sound, etc)
    }

    
    if (validMove) {
      // Score 10 points when moving to a foundation
      if(pile.classList.contains("foundations-pile")) {
        addToScore(SCOREFOUNDATION);
      }

      // Score 5 points when moving from the talon pile
      if(parentPile.classList.contains("talon-pile")) {
        addToScore(SCORETALON);
      }

      // remove cardSelected from the old parent pile
      for (i = 0; i < cardsSelected.length; i++) {
        parentPile.removeChild(cardsSelected[i]);
      }
      // open the last card left in that pile (if any)
      if (parentPile.lastChild) {
        if(!parentPile.lastChild.classList.contains("up")) {
          // New card turned face up, add 5 to score
          addToScore(SCORETABLEAU);
        }
        parentPile.lastChild.classList.add("up");
      }
      // add cardSelected to the end of the new pile
      for (i = 0; i < cardsSelected.length; i++) {
        pile.appendChild(cardsSelected[i]);
      }
    }
    clearSelected();
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

// Deselects all cards and resets double-click timer
function clearSelected() {
  allCards = document.querySelectorAll(`.card`);
  for (i = 0; i < allCards.length; i++) {
    allCards[i].classList.remove("selected");
  }
  clickCount = 0;
  isSelected = false;
}

window.addEventListener("DOMContentLoaded", (event) => {
  attachEventListeners();
});

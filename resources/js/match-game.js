var MatchGame = {};

/*
  Sets up a new game after HTML document has loaded.
  Renders a 4x4 board of cards.
*/

// When this variable is increment to 8, the game will end.
// A function is called each time a pair of cards is matched that
// increments its value by 1, then checks to see if the value is
// equal to 8.

var wonGame = 0;

// the timer is accessed by multiple functions, so its scope is
// set to global.

var $timer = $("#timer");
var $reset = $("#reset");

// This code block is required to ensure that the code runs when the
// page is loaded.
$(document).ready(function() {
  // Initializes the HTML object #game as a jQ variable.
  MatchGame.startGame = function() {
    var active = false;
    var $game = $("#game");
    // Sets the returned array of values to that of a function.
    var values = MatchGame.generateCardValues();
    // Calls the renderCards functions with the args created above.
    MatchGame.renderCards(values, $game);
    // Initiates the timer.
    MatchGame.setTimer($timer, active);
    // Initiates the reset button.
    MatchGame.resetGame($reset);
  };

  // Calls the function to start the game.
  
  MatchGame.startGame();
});

MatchGame.resetGame = function ($reset) {
  $reset.click(function () {
    location.reload();
  });
};

/*
  Generates and returns an array of matching card values.
 */

MatchGame.generateCardValues = function () {
  // An empty list that will hold the two copies of the numbers
  // from 1-8, each representing a card on the board.
  var ordered = [];

  // For every number between 1 and 8, append the value to
  // the ordered list to created matching pairs.
  for (var value = 1; value <= 8; value++) {
    ordered.push(value);
    ordered.push(value);
  };

  // An empty list that will hold a list of randomly generated
  // numbers from the ordered list.
  var cardValues = [];

  // While the length of ordered is greater than zero...
  while (ordered.length > 0) {
    // ...create a new var that is equal to a random integer
    // that is between 1 and the current length of the ordered list
    var newIndex = Math.floor(Math.random()*ordered.length);

    // The randomIndex var is equal to the spliced value of ordered.

    // NOTE: the [0] at the end of the line is to prevent splice()
    // from returning [[1]].
    var randomIndex = ordered.splice(newIndex, 1)[0];

    // The spliced value is pushed (appended) to the end to end of
    // the new empty list.
    cardValues.push(randomIndex);
  };

  // THe random sequence of ints is returned.
  return cardValues;
};

/*
  Converts card values to jQuery card objects and adds them to the supplied game
  object.
*/

MatchGame.renderCards = function(cardValues, $game) {

  // The HTML of the $game board is emptyed completely, meaning that
  // all HTML elements nested within it is erased.
  $game.empty();

  // THe data point "flippedCards" is Initialized as an empty list.

  // NOTE: This list will only ever be 2 items long as it represents
  // the number of cards allowed to be flipped.
  $game.data("flippedCards", []);

  // Stores the backgroundColor of the cards.
  var colors = [
    'hsl(25, 85%, 65%)',
    'hsl(55, 85%, 65%)',
    'hsl(90, 85%, 65%)',
    'hsl(160, 85%, 65%)',
    'hsl(220, 85%, 65%)',
    'hsl(265, 85%, 65%)',
    'hsl(310, 85%, 65%)',
    'hsl(360, 85%, 65%)'];

  // For each value in the cardValues list...
  for (var ivalue = 0; ivalue < cardValues.length; ivalue++) {

    // These variables are created to shorten the .data() code.
    var value = cardValues[ivalue];
    var color = colors[value - 1];

    // JS obj (dictionary) that will be passed as an arg to the .data() method.

    var cardData = {
      // Sets the two vars above as Keys in KV pairs of the dict.
      value: value,
      color: color,
      flipped: false,
    };

    // Creates a new .card HTML object.
    // This object will appear as a card on the page;
    // The card class has its style set in the style.css file.

    var $card = $('<div class="card col-xs-3"></div>');

    // Adds the dictionary created above to the data of the card.
    // In this case, data is simply text associated with the card
    // to help style it.

    $card.data(cardData);

    // Adds the newly created card to the board.
    $game.append($card);

    // When a card is clicked...

    $(".card").click(function() {
      // ... call the function flipcard() with the clicked card and
      // the game board as args.
      MatchGame.flipCard($(this), $("#game"));
    })
  };
};

/*
  Flips over a given card and checks to see if two cards are flipped over.
  Updates styles on flipped cards depending whether they are a match or not.
*/

MatchGame.flipCard = function($card, $game) {

  // If the card that was clicked has a flipped attribute of true...
  if ($card.data("flipped")) {
    // ... then return nothing to leave the function.
    return;
  }

  // Otherwise, add data to the card.
  // NOTE: .css, .text, and .data are all called on $card at once
  // to save space and make the code more readable.
  $card.css('background-color', $card.data('color'))
    .text($card.data('value'))
    .data($card.data('flipped', true));

  // The list below will be used to hold only two cards.
  var flippedCards = $game.data("flippedCards");

  // Adds a card to the list.
  flippedCards.push($card);

  // If the list is two cards long...
  if (flippedCards.length === 2) {
    // ... and then value of both cards is the same...
    if (flippedCards[0].data("value") === flippedCards[1].data("value")) {
      // ... then set both card's CSS to the following ruleset.
      var matchCss = {
        backgroundColor: "rgb(153, 153, 153)",
        color: "gold"
      }

      // The var matchCss is passed to the .css method to alter
      // the CSS of both cards.

      flippedCards[0].css(matchCss);
      flippedCards[1].css(matchCss);

      // A function call is made to increase the user's score
      // for matching a pair.

      MatchGame.checkWin();

    // If the cards were not a match...

    } else {
      // ... then they should resort to their default color scheme after
      // a short time (300 is around a quarter second).
      window.setTimeout(function(){
        var resetCss = {backgroundColor: "rgb(32, 64, 86)"};
        flippedCards[0].css(resetCss).data("flipped", false).text("");
        flippedCards[1].css(resetCss).data("flipped", false).text("");
      }, 300)
    };
    // The flipped cards list is then reset to a blank list.
    $game.data("flippedCards", []);
  }
};

// Called when the users matches a card.-------------------------------

MatchGame.checkWin = function () {

  wonGame++;

  if (wonGame === 8) {
    clearInterval(clockGoing);
    var time_remaining = $timer.text();
    var score = 0;
    if (time_remaining == 60) {
      alert("Cheater")
    } else if (time_remaining >= 45) {
      score = (time_remaining * 100).toString();
      alert("Great Job, your score is: " + score)
    } else if (time_remaining >= 30 && time_remaining <= 44) {
      score = (time_remaining * 80).toString();
      alert("Good Job, your score is: " + score)
    } else if (time_remaining >= 20 && time_remaining <= 43) {
      score = (time_remaining * 40).toString();
      alert("Ok Job, your score is: " + score)
    } else if (time_remaining >= 1 && time_remaining <= 19) {
      score = (time_remaining * 10).toString();
      alert("Bad Job, your score is: " + score)
    } else {
      alert("Try again with the timer on for a score.")
    };
    };
  };

// Flips all the cards on the board if the timer expired.

MatchGame.lostGame = function() {
  var lostGameCard = $(".card");
  var lostCSS = {
    "backgroundColor": "black",
    "color": "white"
  };
  lostGameCard.data("flipped", true).css(lostCSS).text("X");
};

// Applies an optional timer-----------------------------------------


MatchGame.setTimer = function($timer, active) {

  // Seconds represents the number of seconds in the timer.
  // It is global so that it can be reset easily.

  seconds = 60;

  // represents the timer's CSS.

  var timerCSS = {
    "background-color": "white",
    "border": "1px solid blue",
    "height": "7rem",
    "font-size": "3rem",
    "display": "flex",
    "align-items": "center",
    "justify-content": "center"
  };

  // When the timer is clicked, active is set equal to true.
  // This prevents the user from repeatedly clicking the clock to
  // refresh the timer.

  $timer.click(function(){
    active = true
  });

  // The timer begins by using the setInterval function
  // this function is similar to a while loop in that it iterates
  // until until the var i is equal to zero.

  // NOTE: clockGoing is a global variable, meaning that it is accessible
  // in other functions.

  // global variables are declared either outisde of a function, or without
  // the var keyword.

  clockGoing = setInterval(function(){

    // When i reaches 0, active is equal false; this prevents the timer
    // from going into negative numbers.

    if (seconds===0) {
      MatchGame.lostGame();
      active = false;
      clearInterval(clockGoing);
    };

    // If active is equal to true, then i is decreased.

    if (active) {
      console.log("Still active.");
      // Short hand for i = i - i;
      seconds--;
      // Applies text and styling to the timer.
      $timer.text(seconds).css(timerCSS);
    };
  }, 1000);
};

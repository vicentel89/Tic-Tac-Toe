$(function() {
  //Don't write code above this.

  //animation for player selection
  let cpuPlayer = false;

  $("#onePlayer").click(function() {
    $(this).addClass("animated bounceOut");
    $("#players-overlay").delay(300).fadeOut(400);
    cpuPlayer = true;
  })

  $("#twoPlayers").click(function() {
    $(this).addClass("animated bounceOut");
    $("#players-overlay").delay(300).fadeOut(400);
    cpuPlayer = false;
  })


  //Make board resizable
  function resizeBoard() {
    let currentWidth = $('.resizable-board').width();
    $(".resizable-board").css("height", currentWidth + "px");
  }

  resizeBoard();

  $(window).resize(function() {
    resizeBoard();
  });


  //Adjust board for horizontal mobile
  function resizeHorizontalMobile() {
    if (window.orientation == 90 || window.orientation == -90) {
      $(".col-10").removeClass("col-sm-9").addClass("col-sm-5");
    } else {
      $(".col-10").removeClass("col-sm-5");
      $(".winner-grid").addClass("col-sm-9");
    }
  }

  resizeHorizontalMobile();
  $(window).on("orientationchange", resizeHorizontalMobile);


  //Adjust screen height for available heigth screen on mobile.
  function resizeHeight() {
    if (typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1) {
      $(".overlay-row").css("height", window.innerHeight + "px");
      $(".main-container").css("height", window.innerHeight + "px");
    }
  }
  resizeHeight();

  $(window).resize(function() {
    resizeHeight();
  });


  //Make .winner-circle resizable
  function resizeCircle() {
    let viewportHeight = $(window).height();
    let viewportWidth = $(window).width();
    let minViewport = viewportHeight < viewportWidth ? viewportHeight : viewportWidth;
    let newHeight = $('.circle-winner').width() + (minViewport * 0.084);
    $(".circle-winner").css("height", newHeight + "px");
  }

  $(window).resize(function() {
    resizeCircle();
  });


  //Add crosses and circles
  (function() {
    let crossTurn = true;
    let gameOver = false;
    let turnCount = 0;
    let emptySquares = ["sq1", "sq2", "sq3", "sq4", "sq5", "sq6", "sq7", "sq8", "sq9"];
    const totalSquares = ["sq1", "sq2", "sq3", "sq4", "sq5", "sq6", "sq7", "sq8", "sq9"];
    let crossSquares = [];
    let cantPlay = false;

    function getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    //CPU chooses square
    function selectSquare(lowerNum, higherNum) {
      //find in which line will be the selected square
      let lowerLine = (Math.ceil(lowerNum / 3) - 1) * 3;
      let higherLine = (Math.ceil(higherNum / 3) - 1) * 3;
      let lineGap = higherLine - lowerLine;
      let selectedLine = (higherLine + lineGap) % 9;

      //find in which position(in the line) will be the selected square
      let lowerPosition = ((lowerNum - 1) % 3) + 1;
      let higherPosition = ((higherNum - 1) % 3) + 1;
      let positionGap = higherPosition - lowerPosition;
      let selectedPosition = ((((higherPosition + positionGap - 1) % 3) + 3) % 3) + 1;

      //find selected squeare
      let selectedSquare = selectedLine + selectedPosition;

      return selectedSquare;
    }

    //What happen when you click

    $(".square").click(function() {
      //ONE PLAYER
      if (cpuPlayer && !$(this).hasClass("cross") && !$(this).hasClass("circle") && !gameOver && !cantPlay) {
        $(this).addClass("cross");
        checkCross(this.id, "cross");
        turnCount++;
        let circleSquare

        crossSquares.push(emptySquares.splice(emptySquares.findIndex((sq) => sq == this.id), 1)[0]);
        crossSquares.sort();
        console.log(crossSquares);
        if (crossSquares.length >= 2) {
          //Random number in case there is no empty slots for the calculation
          ramdonEmpty = emptySquares[getRndInteger(0, emptySquares.length)];
          circleSquare = totalSquares.findIndex((sq) => sq == ramdonEmpty);

          outerLoop: for (let i = 0; i < crossSquares.length; i++) {
            for (let j = i + 1; j < crossSquares.length; j++) {
              if (i !== j) {
                possibleSquare = selectSquare(crossSquares[i].match(/\d/)[0], crossSquares[j].match(/\d/)[0]) - 1;
                console.log("i: " + i + ",j: " + j + ",crossSquares[i]: " + crossSquares[i] + ",crossSquares[j]: " + crossSquares[j] + ", csq: " + circleSquare + ",totalSquares[circleSquare]: " + totalSquares[circleSquare]);
                if (emptySquares.includes(totalSquares[possibleSquare])) {
                  circleSquare = possibleSquare;
                  console.log("i: " + i + ",j: " + j + ",crossSquares[i]: " + crossSquares[i] + ",crossSquares[j]: " + crossSquares[j] + ", csq: " + circleSquare + ",totalSquares[circleSquare]: " + totalSquares[circleSquare]);
                  break outerLoop;
                }
              }
            }
          }
        } else {
          emptySquares.includes("sq5") ? circleSquare = 4 : circleSquare = 0;
        }

        if (!gameOver) {
          cantPlay = true;
          window.setTimeout(function() {
            $("#" + totalSquares[circleSquare]).addClass("circle");
            checkCircle(totalSquares[circleSquare], "circle");
            turnCount++;
            emptySquares.splice(emptySquares.findIndex((sq) => sq == totalSquares[circleSquare]), 1);
            console.log(emptySquares);
            !gameOver && checkDraw();
            cantPlay = false;
          }, 700);
        }
        //TWO PLAYERS
      } else if (crossTurn && !$(this).hasClass("circle") && !gameOver && !cantPlay) {
        $(this).addClass("cross");
        crossTurn = false;
        checkCross(this.id, "cross");
        turnCount++;
        !gameOver && checkDraw();
      } else if (!$(this).hasClass("cross") && !gameOver && !cantPlay) {
        $(this).addClass("circle");
        crossTurn = true;
        checkCircle(this.id, "circle");
        turnCount++;
        !gameOver && checkDraw();
      }

    });

    ////Check if there is a winner
    let checkCross = squaresChecker()
    let checkCircle = squaresChecker()

    function squaresChecker() {
      const squares = {
        sq1: false,
        sq2: false,
        sq3: false,
        sq5: false,
        sq6: false,
        sq4: false,
        sq7: false,
        sq8: false,
        sq9: false
      };

      return function(id, sign) {
        function someoneWon() {
          gameOver = true;
          sign == "cross" && crossWinner();
          sign == "circle" && circleWinner();
          window.setTimeout(restartGame, 2500);
        }

        squares[id] = true;

        switch (true) {
          case squares.sq1 && squares.sq2 && squares.sq3:
            $("#sq1, #sq2, #sq3").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq4 && squares.sq5 && squares.sq6:
            $("#sq4, #sq5, #sq6").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq7 && squares.sq8 && squares.sq9:
            $("#sq7, #sq8, #sq9").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq1 && squares.sq4 && squares.sq7:
            $("#sq1, #sq4, #sq7").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq2 && squares.sq5 && squares.sq8:
            $("#sq2, #sq5, #sq8").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq3 && squares.sq6 && squares.sq9:
            $("#sq3, #sq6, #sq9").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq1 && squares.sq5 && squares.sq9:
            $("#sq1, #sq5, #sq9").removeClass(sign).addClass(sign + "-win");
            someoneWon();
            break;
          case squares.sq3 && squares.sq5 && squares.sq7:
            $("#sq3, #sq5, #sq7").removeClass(sign).addClass(sign + "-win");
            someoneWon();
        }
      }
    }

    function crossWinner() {
      $("#winner-overlay").delay(700).fadeIn(1000);
      $(".sign-item").addClass("cross-winner");
      $(".winner-font").text("WINNER!");
    }

    function circleWinner() {
      $("#winner-overlay").delay(700).fadeIn(1000);
      $(".sign-item").addClass("circle-winner")
      window.setTimeout(resizeCircle, 701);
      $(".winner-font").text("WINNER!");
    }

    //Check draw
    function checkDraw() {
      if (turnCount >= 9) {
        draw();
        window.setTimeout(restartGame, 2500);
      }
    }

    function draw() {
      $("#winner-overlay").fadeIn(1000);
      $(".sign-item").text("IT'S A").css({
        "text-align": "center",
        "align-self": "end"
      });
      $(".winner-font").text("DRAW");
    }

    //Home screen
    $(".home-btn").click(function() {
      $(".btn").removeClass("animated bounceOut");
      $("#players-overlay").fadeIn();
      restartGame();
    })

    //Restart Game
    function restartGame() {
      checkCross = squaresChecker()
      checkCircle = squaresChecker()
      crossTurn = true;
      gameOver = false;
      turnCount = 0;
      emptySquares = ["sq1", "sq2", "sq3", "sq4", "sq5", "sq6", "sq7", "sq8", "sq9"];
      crossSquares = [];

      $("#sq1, #sq2, #sq3, #sq4, #sq5, #sq6, #sq7, #sq8, #sq9")
        .fadeOut(function() {
          $("#sq1, #sq2, #sq3, #sq4, #sq5, #sq6, #sq7, #sq8, #sq9")
            .removeClass("cross circle cross-win circle-win")
            .show();
        });

      $("#winner-overlay").fadeOut(function() {
        $(".sign-item").removeClass("cross-winner circle-winner").text("").css({
          "text-align": "",
          "align-self": "",
          "height": ""
        });
        $(".winner-font").text("");
      });
    };
  })();


  ////////////////DEBUGGING BUTTONS//////////////////
  /*
    $(".aaa").click(function() {
      //  $(".sign-item").css("height", "4.2vmin");
      //crossWinner();
      //console.log(cpuPlayer)
      checkDraw();
    });*/

  /*
        ///////////////////////////
        $(".aaa").click(function() {

          checkDraw();
        });
        ////////////////////

  $("#winner-overlay").click(function() {
    $("#winner-overlay").hide();

  });

  $("#players-overlay").click(function() {
    //  $(".btn").removeClass("animated bounceOut");
  })

  $(".bbb").click(function() {
    $("#winner-overlay").show();
    //  $(".sign-item").prop("text-align", undefined)
    //  $(".sign-item").css("text-align", "");

  })


  //$(".overlay").click(resizeCircle());


*/


  //Don't write code below this.
});
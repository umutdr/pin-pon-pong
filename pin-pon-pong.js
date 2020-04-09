(function () {
  const board = {
    width: 900,
    height: 600,
    background: '#676',
    position: 'fixed',
    top: '50%',
    left: '50%',
    zIndex: '500',
    border: '7px double #ddd',
    borderLeft: '5px dashed #ccc',
    borderRight: '5px dashed #ccc',
    transform: 'translate(-50%, -50%)',
  };

  const pongContainer = {
    width: '50%',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    margin: 'auto',
  };

  const pongScore = {
    width: '100%',
    height: 100,
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    zIndex: '501',
  };

  const score = {
    width: '50%',
    color: '#fff',
    fontSize: 21,
  };

  const ball = {
    width: 15,
    height: 15,
    position: 'absolute',
    ballY: 0,
    ballX: 0,
    deltaY: 0,
    borderRadius: '0%',
    background: 'orange',
  };

  const line = {
    width: 0,
    height: board.height,
    borderLeft: '2px dashed #fff',
    position: 'absolute',
    top: 0,
    left: Math.round(board.width / 2),
  };

  const stick = {
    width: 12,
    height: 85,
    position: 'absolute',
    background: '#333',
  };

  const stick1 = {
    left: 0,
    top: Math.round(board.height / 2 - stick.height / 2),
  };

  const stick2 = {
    left: board.width - stick.width,
    top: Math.round(board.height / 2 - stick.height / 2),
  };

  let GAME_CONSTS = {
    gameSpeed: 1000 / 60, // 60fps
    score1: 0,
    score2: 0,
    stick1Speed: 0,
    stick2Speed: 0,
    ballYSpeed: 0,
    ballXSpeed: 0,
    targetScore: 5,
  };

  function start() {
    GAME_CONSTS.score1 = localStorage.getItem('pongPlayer1ScoreData') || 0;
    GAME_CONSTS.score2 = localStorage.getItem('pongPlayer2ScoreData') || 0;

    draw();
    setEvents();
    roll();
    loop();
  }

  function draw() {
    $('<div/>', { id: 'pong-container' }).css(pongContainer).appendTo('body');
    $('<div/>', { id: 'pong-game' }).css(board).appendTo('#pong-container');
    $('<div/>', { id: 'pong-score' })
      .css(pongScore)
      .appendTo('#pong-container');
    $('<p/>', { id: 'score1' }).css(score).appendTo('#pong-score');
    $('<p/>', { id: 'score2' }).css(score).appendTo('#pong-score');
    $('<div/>', { id: 'pong-line' }).css(line).appendTo('#pong-game');
    $('<div/>', { id: 'pong-ball' }).css(ball).appendTo('#pong-game');

    $('<div/>', { id: 'stick-1' })
      .css($.extend(stick1, stick))
      .appendTo('#pong-game');

    $('<div/>', { id: 'stick-2' })
      .css($.extend(stick2, stick))
      .appendTo('#pong-game');

    drawScores();
  }

  function setEvents() {
    $(document).on('keydown', (e) => {
      if (e.keyCode == 87) GAME_CONSTS.stick1Speed = -5; // W Key
      if (e.keyCode == 83) GAME_CONSTS.stick1Speed = 5; // S Key
      if (e.keyCode == 38) GAME_CONSTS.stick2Speed = -5; // Up Arrow Key
      if (e.keyCode == 40) GAME_CONSTS.stick2Speed = 5; // Down Arrow Key
    });

    $(document).on('keyup', (e) => {
      if (e.keyCode == 87 || e.keyCode == 83) GAME_CONSTS.stick1Speed = 0;
      if (e.keyCode == 40 || e.keyCode == 38) GAME_CONSTS.stick2Speed = 0;
    });
  }

  function loop() {
    setInterval(() => {
      checkStickCollisionWithBorders();
      checkBallCollisionWithBordersAndSticks();
    }, GAME_CONSTS.gameSpeed);
  }

  function isGameOver() {
    if (checkScores()) {
      confirm(
        `${
          GAME_CONSTS.score1 > GAME_CONSTS.score2
            ? 'Player1 Won!'
            : 'Player2 Won!'
        }`
      );
      localStorage.removeItem('pongPlayer1ScoreData');
      localStorage.removeItem('pongPlayer2ScoreData');
      GAME_CONSTS.score1 = 0;
      GAME_CONSTS.score2 = 0;
    }
    drawScores();
  }

  function checkScores() {
    var player1ScoreLocalData = GAME_CONSTS.score1;
    localStorage.setItem('pongPlayer1ScoreData', player1ScoreLocalData);

    var player2ScoreLocalData = GAME_CONSTS.score2;
    localStorage.setItem('pongPlayer2ScoreData', player2ScoreLocalData);

    return GAME_CONSTS.score1 >= GAME_CONSTS.targetScore ||
      GAME_CONSTS.score2 >= GAME_CONSTS.targetScore
      ? true
      : false;
  }

  function drawScores() {
    $('#score1').text(`Player1 Score: ${GAME_CONSTS.score1}`);
    $('#score2').text(`Player2 Score: ${GAME_CONSTS.score2}`);
  }

  function checkStickCollisionWithBorders() {
    if (stick1.top <= 0) {
      stick1.top = 0;
    } else if (stick1.top >= board.height - stick1.height) {
      stick1.top = board.height - stick1.height;
    }
    stick1.top += GAME_CONSTS.stick1Speed;
    $('#stick-1').css('top', stick1.top);

    if (stick2.top <= 0) {
      stick2.top = 0;
    } else if (stick2.top >= board.height - stick2.height) {
      stick2.top = board.height - stick2.height;
    }
    stick2.top += GAME_CONSTS.stick2Speed;
    $('#stick-2').css('top', stick2.top);
  }

  function checkBallCollisionWithBordersAndSticks() {
    if (ball.ballY <= 0 || ball.ballY >= board.height - ball.height) {
      GAME_CONSTS.ballYSpeed = GAME_CONSTS.ballYSpeed * -1;
    }

    ball.ballY += GAME_CONSTS.ballYSpeed;

    if (ball.ballX <= stick.width) {
      if (
        ball.ballY >= stick1.top - ball.width &&
        ball.ballY <= stick1.top + stick.height
      ) {
        ball.deltaY = ball.ballY - (stick1.top + stick.height / 2);
        GAME_CONSTS.ballYSpeed = ball.deltaY * 0.25;

        GAME_CONSTS.ballXSpeed = GAME_CONSTS.ballXSpeed * -1;
      } else if (ball.ballX <= 0) {
        ++GAME_CONSTS.score2;
      }
    }

    if (ball.ballX >= board.width - ball.width - stick.width) {
      if (
        ball.ballY >= stick2.top - ball.width &&
        ball.ballY <= stick2.top + stick.height
      ) {
        ball.deltaY = ball.ballY - (stick2.top + stick.height / 2);
        GAME_CONSTS.ballYSpeed = ball.deltaY * 0.25;

        GAME_CONSTS.ballXSpeed = GAME_CONSTS.ballXSpeed * -1;
      } else if (ball.ballX >= board.width - ball.width) {
        ++GAME_CONSTS.score1;
      }
    }

    if (ball.ballX <= 0 || ball.ballX >= board.width - ball.width) {
      isGameOver();
      roll();
    }

    ball.ballX += GAME_CONSTS.ballXSpeed;
    $('#pong-ball').css({ top: ball.ballY, left: ball.ballX });
  }

  function roll() {
    ball.ballY = Math.round(board.height / 2);
    ball.ballX = Math.round(board.width / 2 - 15 / 2); // ball.Width = 15

    let sideX = Math.random() > 0.5 ? 1 : -1;
    let sideY = Math.random() > 0.5 ? 1 : -1;

    GAME_CONSTS.ballXSpeed = sideX * (Math.random() * 5 + 3);
    GAME_CONSTS.ballYSpeed = sideY * (Math.random() * 4 + 3);
  }

  start();
})();

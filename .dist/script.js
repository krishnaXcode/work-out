/* =========================================================
   GAME SWITCHING
========================================================= */

const tabs = document.querySelectorAll(".game-tab");

const snakeSection =
    document.getElementById("snakeSection");

const ludoSection =
    document.getElementById("ludoSection");


tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t =>
            t.classList.remove("active")
        );

        tab.classList.add("active");

        const game = tab.dataset.game;

        if (game === "snake") {

            snakeSection.classList.add("active");
            ludoSection.classList.remove("active");

        } else {

            snakeSection.classList.remove("active");
            ludoSection.classList.add("active");

        }

    });

});


/* =========================================================
   SOUND
========================================================= */

let soundEnabled = true;

const soundButton =
    document.getElementById("soundBtn");

let audioContext = null;


function beep(
    frequency = 500,
    duration = .07,
    type = "sine"
) {

    if (!soundEnabled) return;

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            .08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        console.error("Unable to play game sound.", error);
    }

}


soundButton.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        soundButton.textContent =
            soundEnabled ? "🔊" : "🔇";

        if (soundEnabled) {
            beep(600, .1);
        }

    }
);


/* =========================================================
   SNAKE
========================================================= */

const canvas =
    document.getElementById("snakeCanvas");

const ctx =
    canvas.getContext("2d");

const scoreElement =
    document.getElementById("snakeScore");

const bestElement =
    document.getElementById("snakeBest");

const overlay =
    document.getElementById("snakeOverlay");

const startButton =
    document.getElementById("snakeStart");

const pauseButton =
    document.getElementById("snakePause");

const restartButton =
    document.getElementById("snakeRestart");


const GRID = 25;

let snake = [];

let food = {
    x: 12,
    y: 12
};

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let score = 0;

let best =
    Number(
        localStorage.getItem(
            "gameverseSnakeBest"
        )
    ) || 0;

let running = false;

let paused = false;

let gameTimer = null;

let speed = 115;


bestElement.textContent = best;


/* Resize */

function resizeCanvas() {

    const size =
        Math.min(
            canvas.parentElement.clientWidth,
            700
        );

    canvas.width = size;

    canvas.height = size;

    drawSnake();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* Start */

startButton.addEventListener(
    "click",
    () => {
        if (running && paused) {
            paused = false;
            overlay.classList.add("hidden");
            pauseButton.textContent = "⏸ Pause";
            return;
        }

        startSnake();
    }
);

restartButton.addEventListener(
    "click",
    startSnake
);

pauseButton.addEventListener(
    "click",
    togglePause
);


function startSnake() {

    clearInterval(gameTimer);

    snake = [

        {
            x: 12,
            y: 12
        },

        {
            x: 11,
            y: 12
        },

        {
            x: 10,
            y: 12
        }

    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;

    speed = 115;

    running = true;

    paused = false;

    scoreElement.textContent = "0";

    pauseButton.textContent = "⏸ Pause";

    overlay.classList.add("hidden");

    spawnFood();

    gameTimer =
        setInterval(
            snakeTick,
            speed
        );

    beep(550, .12);

    drawSnake();
}


function snakeTick() {

    if (!running || paused) return;

    direction = nextDirection;

    const head = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    /* Wall */

    if (
        head.x < 0 ||
        head.x >= GRID ||
        head.y < 0 ||
        head.y >= GRID
    ) {

        snakeGameOver();

        return;
    }


    const ateFood =
        head.x === food.x &&
        head.y === food.y;

    /* The tail vacates its square unless the snake is growing. */

    if (
        snake.some(
            (segment, index) =>
                segment.x === head.x &&
                segment.y === head.y &&
                (ateFood || index < snake.length - 1)
        )
    ) {

        snakeGameOver();

        return;
    }


    snake.unshift(head);


    /* Food */

    if (ateFood) {

        score++;

        scoreElement.textContent =
            score;

        beep(800, .09, "square");

        if (score > best) {

            best = score;

            bestElement.textContent =
                best;

            localStorage.setItem(
                "gameverseSnakeBest",
                best
            );
        }


        if (!spawnFood()) {
            snakeGameWon();
            return;
        }


        /*
            Increase speed every 5 points.
        */

        if (
            score % 5 === 0 &&
            speed > 55
        ) {

            speed -= 8;

            clearInterval(gameTimer);

            gameTimer =
                setInterval(
                    snakeTick,
                    speed
                );
        }

    } else {

        snake.pop();

    }


    drawSnake();
}


function snakeGameOver() {

    running = false;

    clearInterval(gameTimer);

    overlay.classList.remove("hidden");

    overlay.querySelector(".big-icon")
        .textContent = "💀";

    overlay.querySelector("h2")
        .textContent = "Game Over";

    overlay.querySelector("p")
        .textContent =
            `Score: ${score}`;

    startButton.textContent =
        "↻ Play Again";

    beep(160, .25, "sawtooth");

    drawSnake();
}


function togglePause() {

    if (!running) return;

    paused = !paused;

    pauseButton.textContent =
        paused
            ? "▶ Resume"
            : "⏸ Pause";

    if (paused) {

        overlay.classList.remove(
            "hidden"
        );

        overlay.querySelector(".big-icon")
            .textContent = "⏸";

        overlay.querySelector("h2")
            .textContent = "Paused";

        overlay.querySelector("p")
            .textContent =
                "Take a breath!";

        startButton.textContent =
            "▶ Resume";

    } else {

        overlay.classList.add("hidden");
    }
}


function spawnFood() {

    const availableCells = [];

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            if (!snake.some(part => part.x === x && part.y === y)) {
                availableCells.push({ x, y });
            }
        }
    }

    if (!availableCells.length) {
        return false;
    }

    food = availableCells[
        Math.floor(Math.random() * availableCells.length)
    ];

    return true;
}


function snakeGameWon() {

    running = false;

    clearInterval(gameTimer);

    overlay.classList.remove("hidden");

    overlay.querySelector(".big-icon")
        .textContent = "🏆";

    overlay.querySelector("h2")
        .textContent = "Board Cleared!";

    overlay.querySelector("p")
        .textContent = `Score: ${score}`;

    startButton.textContent = "↻ Play Again";

    beep(900, .3);

    drawSnake();
}


/* Drawing */

function drawSnake() {

    if (!canvas.width) return;

    const cell =
        canvas.width / GRID;


    ctx.fillStyle =
        "#030712";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Grid */

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    for (
        let i = 0;
        i <= GRID;
        i++
    ) {

        const p =
            i * cell;

        ctx.beginPath();

        ctx.moveTo(p, 0);

        ctx.lineTo(
            p,
            canvas.height
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            0,
            p
        );

        ctx.lineTo(
            canvas.width,
            p
        );

        ctx.stroke();
    }


    /* Food */

    ctx.fillStyle =
        "#ef4444";

    ctx.shadowColor =
        "#ef4444";

    ctx.shadowBlur = 18;

    drawRoundRect(

        food.x * cell + cell * .17,

        food.y * cell + cell * .17,

        cell * .66,

        cell * .66,

        cell * .18

    );

    ctx.fill();

    ctx.shadowBlur = 0;


    /* Snake */

    snake.forEach(
        (part, index) => {

            ctx.fillStyle =
                index === 0
                    ? "#4ade80"
                    : "#16a34a";

            ctx.shadowColor =
                index === 0
                    ? "#22c55e"
                    : "transparent";

            ctx.shadowBlur =
                index === 0
                    ? 12
                    : 0;

            drawRoundRect(

                part.x * cell + cell * .06,

                part.y * cell + cell * .06,

                cell * .88,

                cell * .88,

                cell * .2

            );

            ctx.fill();

            ctx.shadowBlur = 0;
        }
    );


    /* Eyes */

    if (snake.length) {

        const head = snake[0];

        const cx =
            head.x * cell;

        const cy =
            head.y * cell;

        ctx.fillStyle = "white";

        const eye =
            cell * .1;


        let positions;


        if (direction.x !== 0) {

            const x =
                direction.x > 0
                    ? cx + cell * .66
                    : cx + cell * .23;

            positions = [

                [x, cy + cell * .28],

                [x, cy + cell * .68]

            ];

        } else {

            const y =
                direction.y > 0
                    ? cy + cell * .66
                    : cy + cell * .23;

            positions = [

                [cx + cell * .28, y],

                [cx + cell * .68, y]

            ];
        }


        positions.forEach(
            ([x, y]) => {

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    eye,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        );
    }
}


function drawRoundRect(
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );
}


/* Keyboard */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        const directions = {

            arrowup: {
                x: 0,
                y: -1
            },

            w: {
                x: 0,
                y: -1
            },

            arrowdown: {
                x: 0,
                y: 1
            },

            s: {
                x: 0,
                y: 1
            },

            arrowleft: {
                x: -1,
                y: 0
            },

            a: {
                x: -1,
                y: 0
            },

            arrowright: {
                x: 1,
                y: 0
            },

            d: {
                x: 1,
                y: 0
            }

        };


        if (!directions[key]) return;

        event.preventDefault();

        setSnakeDirection(
            directions[key]
        );
    }
);


function setSnakeDirection(newDirection) {

    if (!running || paused) return;


    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {

        return;
    }


    nextDirection =
        newDirection;
}


/* Mobile controls */

document
    .querySelectorAll(
        ".mobile-pad button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const directionMap = {

                    up: {
                        x: 0,
                        y: -1
                    },

                    down: {
                        x: 0,
                        y: 1
                    },

                    left: {
                        x: -1,
                        y: 0
                    },

                    right: {
                        x: 1,
                        y: 0
                    }

                };

                setSnakeDirection(
                    directionMap[
                        button.dataset.dir
                    ]
                );

            }
        );

    });


resizeCanvas();


/* =========================================================
   LUDO
========================================================= */

const board =
    document.getElementById("ludoBoard");

const diceButton =
    document.getElementById("diceButton");

const diceDisplay =
    document.getElementById("dice");

const diceText =
    document.getElementById("diceText");

const ludoPlayer =
    document.getElementById("ludoPlayer");

const turnName =
    document.getElementById("turnName");

const playerCountSelect =
    document.getElementById("playerCount");

const playerTypeSettings =
    document.getElementById("playerTypeSettings");

const playerList =
    document.getElementById("playerList");


const colors = [
    "red",
    "green",
    "yellow",
    "blue"
];

const playerNames = [
    "🔴 Player 1",
    "🟢 Player 2",
    "🟡 Player 3",
    "🔵 Player 4"
];

const playerLabels = [
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4"
];

let activePlayerCount = 2;

let playerTypes = [
    "human",
    "computer",
    "human",
    "computer"
];

let turnTimeout = null;

let aiTimeout = null;

let aiActing = false;

let gameOver = false;


/*
    Each player has four tokens.

    -1 = home
     0-51 = track
    52-55 = final lane
     56 = finished
*/

let players = [];

let currentPlayer = 0;

let rolled = false;

let currentDice = 0;


/* Main 52-square track */

const track = [

    [6,1],
    [6,2],
    [6,3],
    [6,4],
    [6,5],

    [5,6],
    [4,6],
    [3,6],
    [2,6],
    [1,6],

    [0,6],
    [0,7],
    [0,8],

    [1,8],
    [2,8],
    [3,8],
    [4,8],
    [5,8],

    [6,9],
    [6,10],
    [6,11],
    [6,12],
    [6,13],

    [7,13],
    [8,13],

    [8,12],
    [8,11],
    [8,10],
    [8,9],

    [9,8],
    [10,8],
    [11,8],
    [12,8],
    [13,8],

    [14,8],
    [14,7],
    [14,6],

    [13,6],
    [12,6],
    [11,6],
    [10,6],
    [9,6],

    [8,5],
    [8,4],
    [8,3],
    [8,2],
    [8,1],

    [7,1]

];


/*
    Player starting points.
*/

const starts = [
    0,
    13,
    26,
    39
];


/*
    Four home positions per player.
*/

const homes = [

    [
        [1,1],
        [1,3],
        [3,1],
        [3,3]
    ],

    [
        [1,11],
        [1,13],
        [3,11],
        [3,13]
    ],

    [
        [11,11],
        [11,13],
        [13,11],
        [13,13]
    ],

    [
        [11,1],
        [11,3],
        [13,1],
        [13,3]
    ]

];


/*
    Final lanes.
*/

const finalLanes = [

    [
        [6,2],
        [6,3],
        [6,4],
        [6,5]
    ],

    [
        [2,8],
        [3,8],
        [4,8],
        [5,8]
    ],

    [
        [8,12],
        [8,11],
        [8,10],
        [8,9]
    ],

    [
        [12,6],
        [11,6],
        [10,6],
        [9,6]
    ]

];


/* Safe positions */

const safeSquares = [
    0,
    8,
    13,
    21,
    26,
    34,
    39,
    47
];


/* Dice emojis */

const diceFaces = [
    "",
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
];


/* Initialize */

function resetLudo() {

    clearTimeout(turnTimeout);
    clearTimeout(aiTimeout);

    players = Array.from(
        { length: activePlayerCount },
        () => ({ tokens: [-1, -1, -1, -1] })
    );

    currentPlayer = 0;

    rolled = false;

    currentDice = 0;

    gameOver = false;

    aiActing = false;

    renderPlayerSettings();

    createBoard();

    updateLudoUI();

    diceDisplay.textContent = "⚀";

    diceText.textContent =
        `${playerNames[currentPlayer]} — roll the dice.`;

    scheduleAITurn();
}


function renderPlayerSettings() {

    playerCountSelect.value =
        String(activePlayerCount);

    playerTypeSettings.innerHTML = "";
    playerList.innerHTML = "";

    for (let index = 0; index < activePlayerCount; index++) {
        const setting = document.createElement("div");
        setting.className = "player-type-setting";

        const label = document.createElement("label");
        label.htmlFor = `playerType${index}`;
        label.textContent = `${playerNames[index]} control`;

        const select = document.createElement("select");
        select.id = `playerType${index}`;
        select.dataset.player = String(index);
        select.setAttribute(
            "aria-label",
            `${playerNames[index]} control`
        );

        [
            ["human", "Human"],
            ["computer", "Computer"]
        ].forEach(([value, text]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        });

        select.value = playerTypes[index];
        select.addEventListener("change", () => {
            playerTypes[index] = select.value;
            resetLudo();
        });

        setting.append(label, select);
        playerTypeSettings.appendChild(setting);

        const playerRow = document.createElement("div");
        playerRow.className =
            `player ${colors[index]}${index === currentPlayer ? " active" : ""}`;
        playerRow.dataset.player = String(index);

        const marker = document.createElement("i");
        const name = document.createElement("span");
        name.textContent =
            `${playerLabels[index]} (${playerTypes[index] === "computer" ? "Computer" : "Human"})`;

        const finished = document.createElement("b");
        finished.id = `home${index}`;
        finished.textContent = "0/4";

        playerRow.append(marker, name, finished);
        playerList.appendChild(playerRow);
    }
}


function createBoard() {

    board.innerHTML = "";


    for (
        let row = 0;
        row < 15;
        row++
    ) {

        for (
            let col = 0;
            col < 15;
            col++
        ) {

            const cell =
                document.createElement("div");

            cell.className =
                "ludo-cell";


            /* Home areas */

            if (
                row < 6 &&
                col < 6
            ) {

                cell.classList.add(
                    "home-red"
                );

            } else if (
                row < 6 &&
                col > 8
            ) {

                cell.classList.add(
                    "home-green"
                );

            } else if (
                row > 8 &&
                col > 8
            ) {

                cell.classList.add(
                    "home-yellow"
                );

            } else if (
                row > 8 &&
                col < 6
            ) {

                cell.classList.add(
                    "home-blue"
                );

            } else {

                cell.classList.add("path");

            }


            /* Colored lanes */

            if (
                col >= 6 &&
                col <= 8 &&
                row >= 1 &&
                row <= 5
            ) {
                cell.classList.add(
                    "green-path"
                );
            }

            if (
                row >= 6 &&
                row <= 8 &&
                col >= 1 &&
                col <= 5
            ) {
                cell.classList.add(
                    "red-path"
                );
            }

            if (
                col >= 6 &&
                col <= 8 &&
                row >= 9 &&
                row <= 13
            ) {
                cell.classList.add(
                    "blue-path"
                );
            }

            if (
                row >= 6 &&
                row <= 8 &&
                col >= 9 &&
                col <= 13
            ) {
                cell.classList.add(
                    "yellow-path"
                );
            }


            /* Center */

            if (
                row >= 6 &&
                row <= 8 &&
                col >= 6 &&
                col <= 8
            ) {

                cell.className =
                    "ludo-cell center";

            }


            /* Starting squares */

            if (
                row === 6 &&
                col === 1
            ) {
                cell.classList.add(
                    "start-red"
                );
            }

            if (
                row === 1 &&
                col === 8
            ) {
                cell.classList.add(
                    "start-green"
                );
            }

            if (
                row === 8 &&
                col === 13
            ) {
                cell.classList.add(
                    "start-yellow"
                );
            }

            if (
                row === 13 &&
                col === 6
            ) {
                cell.classList.add(
                    "start-blue"
                );
            }


            board.appendChild(cell);
        }
    }


    renderTokens();
}


/* Get token coordinate */

function tokenCoordinate(
    playerIndex,
    tokenIndex
) {

    const position =
        players[playerIndex]
            .tokens[tokenIndex];


    /* Home */

    if (position === -1) {

        return homes[
            playerIndex
        ][tokenIndex];
    }


    /* Main track */

    if (
        position >= 0 &&
        position < 52
    ) {

        const trackIndex =
            (
                starts[playerIndex] +
                position
            ) % 52;

        return track[
            trackIndex
        ];
    }


    /* Final lane */

    if (
        position >= 52 &&
        position <= 55
    ) {

        return finalLanes[
            playerIndex
        ][position - 52];
    }


    /* Finished */

    if (position === 56) {

        return finalLanes[
            playerIndex
        ][3];
    }


    return null;
}


/* Render tokens */

function renderTokens() {

    board
        .querySelectorAll(".token")
        .forEach(
            token => token.remove()
        );


    players.forEach(
        (player, playerIndex) => {

            player.tokens.forEach(
                (position, tokenIndex) => {

                    const coordinate =
                        tokenCoordinate(
                            playerIndex,
                            tokenIndex
                        );

                    if (!coordinate) return;


                    const [
                        row,
                        col
                    ] = coordinate;


                    const cell =
                        board.children[
                            row * 15 + col
                        ];


                    const token =
                        document.createElement(
                            "button"
                        );


                    token.className =
                        `token ${colors[playerIndex]}`;


                    token.dataset.player =
                        playerIndex;

                    token.dataset.token =
                        tokenIndex;


                    if (
                        rolled &&
                        playerIndex ===
                        currentPlayer &&
                        canMoveToken(
                            playerIndex,
                            tokenIndex
                        )
                    ) {

                        token.classList.add(
                            "selectable"
                        );
                    }


                    token.addEventListener(
                        "click",
                        () => {

                            moveToken(
                                playerIndex,
                                tokenIndex
                            );

                        }
                    );


                    cell.appendChild(token);
                }
            );

        }
    );
}


/* Dice */

diceButton.addEventListener(
    "click",
    rollDice
);

playerCountSelect.addEventListener(
    "change",
    () => {
        activePlayerCount =
            Number(playerCountSelect.value);
        resetLudo();
    }
);


function rollDice() {

    if (
        gameOver ||
        (playerTypes[currentPlayer] === "computer" && !aiActing)
    ) {
        return;
    }

    if (rolled) {

        diceText.textContent =
            "Choose a highlighted token.";

        return;
    }


    currentDice =
        Math.floor(
            Math.random() * 6
        ) + 1;


    rolled = true;

    diceDisplay.textContent =
        diceFaces[currentDice];

    updateLudoUI();


    diceButton.animate(
        [
            {
                transform:
                    "rotate(0) scale(.8)"
            },
            {
                transform:
                    "rotate(360deg) scale(1)"
            }
        ],
        {
            duration: 350
        }
    );


    beep(
        350 + currentDice * 80,
        .12
    );


    const possible =
        getMovableTokens(
            currentPlayer
        );


    if (!possible.length) {

        diceText.textContent =
            currentDice === 6
                ? "No token can move. Roll again."
                : "No possible move. Turn passes.";

        renderTokens();


        if (currentDice === 6) {

            turnTimeout = setTimeout(
                () => {

                    rolled = false;

                    diceText.textContent =
                        "Roll again.";

                    renderTokens();

                    updateLudoUI();

                    scheduleAITurn();

                },
                900
            );

        } else {

            turnTimeout = setTimeout(
                nextTurn,
                900
            );
        }

        return;
    }


    diceText.textContent =
        currentDice === 6
            ? "Choose a token — rolling a 6 gives another turn."
            : "Choose a highlighted token.";

    renderTokens();
}


/* Can token move? */

function canMoveToken(
    playerIndex,
    tokenIndex
) {

    const position =
        players[playerIndex]
            .tokens[tokenIndex];


    if (position === 56) {
        return false;
    }


    /* Home requires 6 */

    if (position === -1) {
        return currentDice === 6;
    }


    return (
        position + currentDice <= 56
    );
}


function getMovableTokens(
    playerIndex
) {

    const result = [];


    players[playerIndex]
        .tokens
        .forEach(
            (position, index) => {

                if (
                    canMoveToken(
                        playerIndex,
                        index
                    )
                ) {

                    result.push(index);
                }

            }
        );


    return result;
}


function scheduleAITurn() {

    clearTimeout(aiTimeout);

    if (
        gameOver ||
        rolled ||
        playerTypes[currentPlayer] !== "computer"
    ) {
        updateLudoUI();
        return;
    }

    diceText.textContent =
        `${playerNames[currentPlayer]} (Computer) is thinking...`;

    updateLudoUI();

    aiTimeout = setTimeout(
        playAITurn,
        650
    );
}


function playAITurn() {

    if (
        gameOver ||
        playerTypes[currentPlayer] !== "computer"
    ) {
        return;
    }

    aiActing = true;

    rollDice();

    if (!rolled) {
        aiActing = false;
        return;
    }

    const possibleTokens =
        getMovableTokens(currentPlayer);

    if (possibleTokens.length) {
        const chosenToken =
            chooseAIToken(possibleTokens);

        moveToken(currentPlayer, chosenToken);
    }

    aiActing = false;
}


function chooseAIToken(tokenIndices) {

    const playerIndex = currentPlayer;
    let bestToken = tokenIndices[0];
    let bestScore = -Infinity;

    tokenIndices.forEach(tokenIndex => {
        const position = players[playerIndex].tokens[tokenIndex];
        const nextPosition =
            position === -1
                ? 0
                : position + currentDice;

        let score =
            position === -1
                ? 25
                : nextPosition * .25;

        if (nextPosition === 56) {
            score += 1000;
        } else if (nextPosition >= 52) {
            score += 18;
        }

        if (nextPosition >= 0 && nextPosition < 52) {
            const absolute =
                (starts[playerIndex] + nextPosition) % 52;

            if (safeSquares.includes(absolute)) {
                score += 12;
            } else {
                players.forEach((opponent, opponentIndex) => {
                    if (opponentIndex === playerIndex) return;

                    opponent.tokens.forEach(opponentPosition => {
                        if (
                            opponentPosition >= 0 &&
                            opponentPosition < 52 &&
                            (starts[opponentIndex] + opponentPosition) % 52 === absolute
                        ) {
                            score += 80;
                        }
                    });
                });
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestToken = tokenIndex;
        }
    });

    return bestToken;
}


/* Move */
function moveToken(
    playerIndex,
    tokenIndex
) {

    if (gameOver) return;

    if (!rolled) {

        diceText.textContent =
            "Roll the dice first.";

        return;
    }


    if (
        playerIndex !== currentPlayer
    ) {

        diceText.textContent =
            "Wait for your turn.";

        return;
    }

    if (
        playerTypes[playerIndex] === "computer" &&
        !aiActing
    ) {
        return;
    }


    if (
        !canMoveToken(
            playerIndex,
            tokenIndex
        )
    ) {

        diceText.textContent =
            "That token cannot move.";

        return;
    }


    const oldPosition =
        players[playerIndex]
            .tokens[tokenIndex];


    /* Bring out */

    if (oldPosition === -1) {

        players[playerIndex]
            .tokens[tokenIndex] = 0;

    } else {

        players[playerIndex]
            .tokens[tokenIndex] +=
            currentDice;
    }


    beep(
        650,
        .1
    );


    /* Capture */

    captureTokens(
        playerIndex,
        tokenIndex
    );


    const won =
        checkWin(
            playerIndex
        );


    rolled = false;

    renderTokens();

    updateLudoUI();


    if (won) {

        gameOver = true;
        updateLudoUI();
        diceText.textContent =
            `${playerNames[playerIndex]} wins Ludo!`;

        setTimeout(
            () => {

                beep(
                    900,
                    .3
                );

                alert(
                    `🏆 ${playerNames[playerIndex]} wins Ludo!`
                );

            },
            100
        );

        return;
    }


    /* Six = extra turn */

    if (currentDice === 6) {

        diceText.textContent =
            `${playerNames[playerIndex]} gets another turn!`;

        currentDice = 0;

        renderTokens();

        scheduleAITurn();

        return;
    }


    nextTurn();
}


/* Capture */

function captureTokens(
    playerIndex,
    tokenIndex
) {

    const position =
        players[playerIndex]
            .tokens[tokenIndex];


    if (
        position < 0 ||
        position >= 52
    ) {

        return;
    }


    const absolute =
        (
            starts[playerIndex] +
            position
        ) % 52;


    /* Safe */

    if (
        safeSquares.includes(
            absolute
        )
    ) {

        return;
    }


    players.forEach(
        (opponent, opponentIndex) => {

            if (
                opponentIndex === playerIndex
            ) {
                return;
            }


            opponent.tokens.forEach(
                (opponentPosition, index) => {

                    if (
                        opponentPosition >= 0 &&
                        opponentPosition < 52
                    ) {

                        const opponentAbsolute =
                            (
                                starts[
                                    opponentIndex
                                ] +
                                opponentPosition
                            ) % 52;


                        if (
                            opponentAbsolute ===
                            absolute
                        ) {

                            opponent.tokens[index] =
                                -1;

                            beep(
                                180,
                                .2,
                                "sawtooth"
                            );
                        }
                    }

                }
            );

        }
    );
}


/* Win */

function checkWin(
    playerIndex
) {

    return players[
        playerIndex
    ].tokens.every(
        position =>
            position === 56
    );
}


/* Next turn */

function nextTurn() {

    rolled = false;

    currentDice = 0;

    currentPlayer =
        (
            currentPlayer + 1
        ) % activePlayerCount;


    diceDisplay.textContent =
        "⚀";


    diceText.textContent =
        `${playerNames[currentPlayer]} — roll the dice.`;


    updateLudoUI();

    renderTokens();

    scheduleAITurn();
}


/* UI */

function updateLudoUI() {

    const currentPlayerName =
        `${playerNames[currentPlayer]}${playerTypes[currentPlayer] === "computer" ? " (Computer)" : ""}`;

    ludoPlayer.textContent = currentPlayerName;

    turnName.textContent = currentPlayerName;

    diceButton.disabled =
        gameOver ||
        rolled ||
        playerTypes[currentPlayer] === "computer";


    document
        .querySelectorAll("#playerList .player")
        .forEach(
            (player, index) => {

                player.classList.toggle(
                    "active",
                    index === currentPlayer
                );

            }
        );


    players.forEach(
        (player, index) => {

            const finished =
                player.tokens.filter(
                    position =>
                        position === 56
                ).length;


            document.getElementById(
                `home${index}`
            ).textContent =
                `${finished}/4`;
        }
    );
}


/* Restart */

document
    .getElementById("ludoRestart")
    .addEventListener(
        "click",
        () => {

            beep(
                500,
                .1
            );

            resetLudo();

        }
    );


/* Start Ludo */

resetLudo();
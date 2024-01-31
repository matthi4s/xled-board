import {Board, Color, Position} from "../index.js";
import * as readline from "readline";

// setup board
let board = new Board();

let width = parseInt(process.argv[2]);
let height = parseInt(process.argv[3]);

await board.discoverDevices(1000);
await board.mapLayout({width, height});
board.start();

// init variables
const STATE_STARTING = 0, STATE_RUNNING = 1, STATE_GAME_OVER = 2;
let state = STATE_STARTING;
let snake = [];
let direction = new Position(1, 0);
let tickInterval;

// input
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
    switch (key.name) {
        case 'up':
            if (direction.getY() === 0 || snake.length === 1) {
                direction = new Position(0, 1);
            }
            break;
        case 'down':
            if (direction.getY() === 0 || snake.length === 1) {
                direction = new Position(0, -1);
            }
            break;
        case 'left':
            if (direction.getX() === 0 || snake.length === 1) {
                direction = new Position(-1, 0);
            }
            break;
        case 'right':
            if (direction.getX() === 0 || snake.length === 1) {
                direction = new Position(1, 0);
            }
            break;
        case 'c':
            if (key.ctrl) {
                process.exit();
            }
            return;
        default:
            return;
    }

    if (state === STATE_STARTING) {
        run();
    }
});

function start() {
    board.setColorForAll(Color.BLACK);
    let startLed = board.getLayout().getRandom();
    startLed.setColor(Color.BLUE);
    snake = [startLed.getPosition()];
    placeFood();
    state = STATE_STARTING;
}

function run() {
    state = STATE_RUNNING;
    tickInterval = setInterval(tick, 200);
}

function tick() {
    let oldHeadPosition = snake[0];
    board.setColor(oldHeadPosition, Color.WHITE);

    let headPosition = oldHeadPosition.clone().addPosition(direction);
    let led = board.getLayout().getByPosition(headPosition);

    // hit wall
    if (!led) {
        gameOver();
        return;
    }

    // eat food
    if (led.getColor().isEqualTo(Color.GREEN)) {
        placeFood();
    } else {
        let tail = snake.pop();
        board.getLayout().getByPosition(tail).setColor(Color.BLACK);
    }

    // hit self
    if (led.getColor().isEqualTo(Color.WHITE)) {
        gameOver();
        return;
    }

    // move
    led.setColor(Color.BLUE);
    snake.unshift(headPosition);
}

function placeFood() {
    let led;
    do {
        led = board.getLayout().getRandom();
    } while (!led.getColor().isEqualTo(Color.BLACK));
    led.setColor(Color.GREEN);
}

function gameOver() {
    state = STATE_GAME_OVER;
    board.setColorForAll(Color.RED);
    clearInterval(tickInterval);
    console.log("Game Over! Score: " + snake.length);
    setTimeout(start, 3000);
}

start();
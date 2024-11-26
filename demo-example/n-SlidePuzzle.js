const SCREEN_SIZE = {
    WIDTH: 300,
    HEIGHT: 300
};

class SPVector {
    x;
    y;

    constructor(...args) {
        if (args.length == 1) {
            // SPVector
            return new SPVector(args[0].x, args[0].y);
        } else if (args.length == 2) {
            // number, number
            this.x = args[0];
            this.y = args[1];
        }
    }
}

class SPState {
    static FACTORIALS = [1, 1, 2, 3 * 2, 4 * 3 * 2, 5 * 4 * 3 * 2, 6 * 5 * 4 * 3 * 2,
        7 * 6 * 5 * 4 * 3 * 2, 8 * 7 * 6 * 5 * 4 * 3 * 2,
        9 * 8 * 7 * 6 * 5 * 4 * 3 * 2, 10 * 9 * 8 * 7 * 6 * 5 * 4 * 3 * 2];

    tiles; // Array(Array(number))
    hole; // SPVector


    constructor(...args) {
        if (args.length == 0) {
            return new SPState(3);
        } else if (args.length == 1) {
            if (typeof args[0] === "number") {
                // number
                if (SPState.FACTORIALS.length <= args[0] ** 2) {
                    for (let i = SPState.FACTORIALS.length; i <= args[0] ** 2; i++) {
                        SPState.FACTORIALS[i] = SPState.FACTORIALS[i - 1] * i;
                    }
                }
                this.tiles = [];
                for (let y = 0; y < args[0]; y++) {
                    this.tiles[y] = [];
                    for (let x = 0; x < args[0]; x++) {
                        this.tiles[y][x] = y * args[0] + x + 1;
                    }
                }
                this.tiles[args[0] - 1][args[0] - 1] = 0;
                this.hole = new SPVector(args[0] - 1, args[0] - 1);
                this.shuffle();
            } else if (args[0] instanceof SPState) {
                // SPState
                this.tiles = [];
                for (let y = 0; y < args[0].tiles.length; y++) {
                    this.tiles[y] = [];
                    for (let x = 0; x < args[0].tiles[y].length; x++) {
                        this.tiles[y][x] = args[0].tiles[y][x];
                    }
                }
                this.hole = new SPVector(args[0].hole);
            }
        } else if (args.length == 2) {
            // SPState, SPVector
            let _ = new SPState(args[0]);
            this.tiles = _.tiles;
            this.hole = _.hole;
            let newHoleX = this.hole.x + args[1].x;
            let newHoleY = this.hole.y + args[1].y;
            this.tiles[this.hole.y][this.hole.x] = this.tiles[newHoleY][newHoleX];
            this.tiles[newHoleY][newHoleX] = 0;
            this.hole.x = newHoleX;
            this.hole.y = newHoleY;
        }
    }

    getId() {
        let t = [];
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                t[this.tiles.length * y + x] = this.tiles[y][x];
            }
        }
        let id = 0;
        // console.log(t);
        for (let i = 0; i < t.length; i++) {
            id += t[i] * SPState.FACTORIALS[t.length - i];
            for (let j = i + 1; j < t.length; j++) {
                if (t[j] > t[i]) {
                    t[j]--;
                }
            }
        }
        return id;
    }

    checkSuccess() {
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                if (!((x == this.tiles.length - 1 && y == this.tiles[x].length - 1 && this.tiles[y][x] == 0) ||
                    this.tiles[y][x] == this.tiles.length * y + x + 1)) {
                    return false;
                }
            }
        }
        return true;
    }

    move(x, y) {
        if (this.isMovable(x, y)) {
            this.tiles[this.hole.y][this.hole.x] = this.tiles[y][x];
            this.tiles[y][x] = 0;
            this.hole = new SPVector(x, y);
        }
    }

    isMovable(x, y) {
        if (x < 0 || x >= this.tiles.length || y < 0 || y >= this.tiles[0].length) {
            return false;
        }
        if ((Math.abs(this.hole.x - x) + Math.abs(this.hole.y - y)) != 1) {
            return false;
        }
        return true;
    }

    shuffle() {
        for (let i = 0; i < 1000; i++) {
            let x = this.hole.x + Math.floor(Math.random() * this.tiles.length) - 1;
            let y = this.hole.y + Math.floor(Math.random() * this.tiles[0].length) - 1;
            this.move(x, y);
        }
    }

    draw() {
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[0].length; x++) {
                if (this.tiles[y][x] != 0) {
                    fill("#ffffff");
                    rect(x * SCREEN_SIZE.WIDTH / this.tiles.length, y * SCREEN_SIZE.HEIGHT / this.tiles[0].length,
                        SCREEN_SIZE.WIDTH / this.tiles.length, SCREEN_SIZE.HEIGHT / this.tiles[0].length);
                    textSize(32);
                    fill("#000000");
                    textAlign(CENTER, CENTER);
                    text(this.tiles[y][x], (x + 0.5) * SCREEN_SIZE.WIDTH / this.tiles.length,
                        (y + 0.5) * SCREEN_SIZE.HEIGHT / this.tiles.length);
                }
            }
        }
    }
}

class SlidePuzzle {
    static UP = new SPVector(0, -1);
    static RIGHT = new SPVector(1, 0);
    static DOWN = new SPVector(0, 1);
    static LEFT = new SPVector(-1, 0);
    static DIRECTIONS = [SlidePuzzle.UP, SlidePuzzle.RIGHT, SlidePuzzle.DOWN, SlidePuzzle.LEFT];

    stateDepths; // Array(number)
    solution; // Array(SPVector)

    constructor() {
        this.stateDepths = []; // number
        this.solution = []; // SPVector
    }

    getSolution() {
        return this.solution;
    }

    record(move) {
        this.solution.push(move);
    }

    idSearch(state, depth, currentLimit) {
        let id = state.getId();
        // console.log(`depth: ${depth}, id: ${id}, this.stateDepths[id]: ${this.stateDepths[id]}`);
        if (depth < this.stateDepths[id]) {
            this.stateDepths[id] = depth;
            if (state.checkSuccess()) {
                return true;
            }
            if (depth == currentLimit) {
                return false;
            }
            for (let to = 0; to < SlidePuzzle.DIRECTIONS.length; to++) {
                if (!((state.hole.y == 0 && to == 0) || (state.hole.x == state.tiles.length - 1 && to == 1) ||
                    (state.hole.y == state.tiles[0].length - 1 && to == 2) || (state.hole.x == 0 && to == 3))) {
                    if (this.idSearch(new SPState(state, SlidePuzzle.DIRECTIONS[to]), depth + 1, currentLimit)) {
                        this.record(SlidePuzzle.DIRECTIONS[to]);
                        return true;
                    }
                }
            }
            return false;
        }
        return false;
    }

    solve(initialState, depthLimit) {
        for (let l = 0; l <= depthLimit; l++) {
            for (let i = 0; i < SPState.FACTORIALS[SPState.FACTORIALS.length - 1]; i++) {
                try {
                    this.stateDepths[i] = Number.MAX_SAFE_INTEGER; // Number.MAX_VALUE
                    // this.stateDepths.push(Number.MAX_SAFE_INTEGER);
                } catch (e) {
                    console.log(i);
                    console.log(e);
                }
            }
            if (this.idSearch(new SPState(initialState), 0, l)) {
                console.log("Solved!");
                return true;
            }
        }
        return false;
    }
}

let state = new SPState();
let sp = new SlidePuzzle();

function setup() {
    createCanvas(SCREEN_SIZE.WIDTH, SCREEN_SIZE.HEIGHT);
}

function draw() {
    background(0);
    state.draw();
    if (state.checkSuccess()) {
        fill("red");
        text("Complete!\nPress R to retry.", SCREEN_SIZE.WIDTH / 2, SCREEN_SIZE.HEIGHT / 2);
    }
}

function mousePressed() {
    let x = Math.floor(mouseX / SCREEN_SIZE.WIDTH * state.tiles.length);
    let y = Math.floor(mouseY / SCREEN_SIZE.HEIGHT * state.tiles[0].length);
    state.move(x, y);
}

async function keyPressed() {
    sp = new SlidePuzzle();
    if (key === "ArrowUp") {
        state.move(state.hole.x, state.hole.y + 1);
    } else if (key === "ArrowDown") {
        state.move(state.hole.x, state.hole.y - 1);
    } else if (key === "ArrowLeft") {
        state.move(state.hole.x + 1, state.hole.y);
    } else if (key === "ArrowRight") {
        state.move(state.hole.x - 1, state.hole.y);
    } else if (key == "r") {
        state = new SPState();
    } else if (key == "s") {
        if (sp.solve(state, 40)) {
            let id = ++__id__;
            for (let s of sp.getSolution().reverse()) {
                console.log(s);
                if (s.x == 0 && s.y == 1) {
                    await keyInputTest("ArrowUp");
                    console.log("ArrowUp");
                } else if (s.x == -1 && s.y == 0) {
                    await keyInputTest("ArrowRight");
                    console.log("ArrowRight");
                } else if (s.x == 0 && s.y == -1) {
                    await keyInputTest("ArrowDown");
                    console.log("ArrowDown");
                } else if (s.x == 1 && s.y == 0) {
                    await keyInputTest("ArrowLeft");
                    console.log("ArrowLeft");
                }
            }
            console.log("");
        } else {
            console.log("Failed");
        }
    }
}

let __id__ = 0;
async function sleep(ms) {
    let id = ++__id__;
    return new Promise((resolve, reject) => {
        if (id !== __id__) {
            reject();
        } else {
            setTimeout(resolve, ms);
        }
    });
}

async function keyInputTest(key) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
    await sleep(100);
}

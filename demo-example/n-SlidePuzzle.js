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
            if (args[0] instanceof SPState && args[1] instanceof SPVector) {
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
            } else if (args[0] instanceof Array && args[1] instanceof Object) {
                // Array(Array(number)), Object: {x: number, y: number}
                this.tiles = args[0];
                this.hole = new SPVector(args[1]);
            }
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
                fill("#ffffff");
                rect(x * SCREEN_SIZE.WIDTH / this.tiles.length, y * SCREEN_SIZE.HEIGHT / this.tiles[0].length + MARGIN.y,
                    SCREEN_SIZE.WIDTH / this.tiles.length, SCREEN_SIZE.HEIGHT / this.tiles[0].length);
                textSize(32);
                fill("#000000");
                textAlign(CENTER, CENTER);
                if (this.tiles[y][x] != 0) {
                    text(this.tiles[y][x], (x + 0.5) * SCREEN_SIZE.WIDTH / this.tiles.length,
                        (y + 0.5) * SCREEN_SIZE.HEIGHT / this.tiles.length + MARGIN.y);
                }
            }
        }
    }

    static copy() {
        return new SPState(this);
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

const SCREEN_SIZE = {
    WIDTH: 300,
    HEIGHT: 300
};

const MARGIN = { x: 10, y: 80 }

let canvas;
let environment;
let restart_button;
let draw_button;
let ff_button;
let save_frame;
let frames;
let slider;
let myfont;
let stop_flag;

// let state = new SPState();
let sp = new SlidePuzzle();

function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.otf");
}

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        state: new SPState(),
        savedFrameCount: 0,
    };
}

function setup() {
    createCanvas(SCREEN_SIZE.WIDTH, SCREEN_SIZE.HEIGHT + MARGIN.y);
    // textFont(myfont);
    background("white");
    frameRate(0);
    initializeVars();


    restart_button = createButton("restart");
    restart_button.position(MARGIN.x + 0, 10);
    draw_button = createButton("stop");
    draw_button.position(MARGIN.x + 100, 10);
    ff_button = createButton("fast forward");
    ff_button.position(MARGIN.x + 190, 10);
    ff_button.elt.disabled = true;
    save_frame = createCheckbox("save frame");
    save_frame.position(MARGIN.x - 5, 50);
    // save_frame.elt.children[0].children[0].disabled = true;
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 85, 50);
    slider.size(200);
    slider.elt.disabled = true;

    restart_button.mousePressed(() => {
        // push();
        // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
        if (/*environment.*/stop_flag) {
            /*environment.*/stop_flag = !/*environment.*/stop_flag;
            draw_button.html("stop");
        }
        if (!slider.elt.disabled) {
            slider.elt.disabled = true;
        }
        draw_button.elt.disabled = false;
        // ff_button.elt.disabled = false;
        // frameRate(30);
        background(255);
        initializeVars();
        drawFlag = false;
        // showVars(environment);
        // frameRate(FPS);
        // pop();
        redraw();
    });

    draw_button.mousePressed(() => {
        /*environment.*/stop_flag = !/*environment.*/stop_flag;
        // stop: true, start: false
        if (/*environment.*/stop_flag) {
            frameRate(0);
            draw_button.html("start");
            // ff_button.elt.disabled = true;
            slider.elt.disabled = false;
            slider.attribute("min", 1);
            slider.attribute("max", frameCount);
            slider.value(frameCount);
            frames[frames.length - 1].savedFrameCount = frameCount;
            // environment.savedFrameCount = frameCount;
            console.log(frameCount);

            // frames[frameCount-frames[0].savedFrameCount] = environment;
            // console.log(frameCount-frames[0].savedFrameCount); 

            // showVars(environment);
            if (save_frame.checked()) {
                /* サーバにframecountを渡す */
                // socket.emit("saveFrameCount", frameCount);
                // socket.emit("saveEnvironment", environment);
                // socket.emit("saveFrame", frames);
                // let base64Array = imagesToBase64Array(frames);
                // socket.emit("saveFrame", base64Array);

                /* VS CodeにframeCountを渡す */
                vscode.postMessage({
                    command: "snapshot",
                    frameCount: frameCount,
                    // save_frame_flag: save_frame.checked(),
                    environment: JSON.parse(JSON.stringify(environment)),
                    frames: JSON.parse(JSON.stringify(frames)),
                });
            }
        } else {
            // frameRate(FPS);
            draw_button.html("stop");
            // ff_button.elt.disabled = false;
            slider.elt.disabled = true;
            while (frames.length > frameCount) {
                frames.pop();
            }
        }
    });

    ff_button.mousePressed(() => {
        environment.ff_flag = true;
        frameRate(5);
    });

    ff_button.mouseReleased(() => {
        environment.ff_flag = false;
        frameRate(1);
    });

    save_frame.mouseReleased(() => {
        /* サーバにsave_frameを渡す */
        /* checkedはクリックする前の値なので反転させる */
        // socket.emit("saveFrame", !save_frame.checked());
    });

    slider.input(() => {
        if (/*environment.*/stop_flag) {
            // push();
            background(255);
            // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
            drawFrame(frames[slider.value() - 1], slider.value());
            // image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            // pop();
        }
    })

    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
            case "snapshot":
                // console.log(message);

                if (message.frameCount !== undefined) {
                    // frameCount = message.frameCount;
                }
                if (Object.keys(message.environment).length !== 0) {
                    environment = message.environment;
                    // environment.state = SPState.copy(message.environment.state);
                    environment.state = new SPState(message.environment.state.tiles, message.environment.state.hole);
                }
                if (message.save_frame_flag !== undefined) {
                    if (message.save_frame_flag !== save_frame.checked()) {
                        save_frame.checked(message.save_frame_flag);
                    }
                }
                if (message.frames.length > 0) {
                    frames = message.frames;
                    for (let i = 0; i < message.frames.length; i++) {
                        // frames[i].state = SPState.copy(message.frames[i].state);
                        frames[i].state = new SPState(message.frames[i].state.tiles, message.frames[i].state.hole);
                    }
                }
                // frameRate(FPS);
                frameRate(30);
                break;
        }
    });
}

function draw() {
    background("white");
    if (environment.stop_flag) {
        // stop
    } else {
        // start
        if (frameCount <= frames.length) {
            frameRate(10);
            drawFrame(frames[frameCount - 1], frameCount);
            if (frameCount === frames.length) {
                frameRate(0);
            }
        } else {
            drawFrame();
            let _env = JSON.parse(JSON.stringify(environment));
            frames.push(_env);
            frameRate(0);
        }
    }
}

function drawFrame(env = -1, fc = -1) {
    if (env === -1) {

    } else {
        environment = JSON.parse(JSON.stringify(env));
        frameCount = fc;

        environment.state = new SPState(environment.state.tiles, environment.state.hole);
        console.log(environment);
    }
    environment.state.draw();
    if (environment.state.checkSuccess()) {
        fill("red");
        text("Complete!\nPress R to retry.", SCREEN_SIZE.WIDTH / 2, MARGIN.y + SCREEN_SIZE.HEIGHT / 2);
    }
}

function mousePressed() {
    if (!stop_flag) {
        let x = Math.floor(mouseX / SCREEN_SIZE.WIDTH * environment.state.tiles.length);
        let y = Math.floor((mouseY - MARGIN.y) / SCREEN_SIZE.HEIGHT * environment.state.tiles[0].length);
        if (environment.state.isMovable(x, y)) {
            environment.state.move(x, y);
            redraw();
        }
    }
}

async function keyPressed() {
    sp = new SlidePuzzle();
    if (!stop_flag) {
        let x, y;
        if (key === "ArrowUp") {
            x = environment.state.hole.x;
            y = environment.state.hole.y + 1;
        } else if (key === "ArrowDown") {
            x = environment.state.hole.x;
            y = environment.state.hole.y - 1;
        } else if (key === "ArrowLeft") {
            x = environment.state.hole.x + 1;
            y = environment.state.hole.y;
        } else if (key === "ArrowRight") {
            x = environment.state.hole.x - 1;
            y = environment.state.hole.y;
        }
        if (environment.state.isMovable(x, y)) {
            environment.state.move(x, y);
            redraw();
        }
    }
    if (key == "r") {
        initializeVars();
        redraw();
    } else if (key == "s") {
        try {
            await automaticallyMove();
        } catch (e) {
            console.log(e);
        }
    }
}

async function automaticallyMove() {
    if (sp.solve(environment.state, 40)) {
        for (let s of sp.getSolution().reverse()) {
            console.log(s);
            if (s.x == 0 && s.y == 1) {
                await EventMacro.keyInputTest("ArrowUp");
                console.log("ArrowUp");
            } else if (s.x == -1 && s.y == 0) {
                await EventMacro.keyInputTest("ArrowRight");
                console.log("ArrowRight");
            } else if (s.x == 0 && s.y == -1) {
                await EventMacro.keyInputTest("ArrowDown");
                console.log("ArrowDown");
            } else if (s.x == 1 && s.y == 0) {
                await EventMacro.keyInputTest("ArrowLeft");
                console.log("ArrowLeft");
            }
        }
        console.log("");
    } else {
        console.log("Failed");
    }
}

// let __id__ = 0;
// async function sleep(ms) {
//     const calledTime = Date.now();
//     const targetTime = calledTime + ms;

//     let id = ++__id__;

//     return new Promise((resolve, reject) => {
//         function checkTime() {
//             if (Date.now() >= targetTime) {
//                 resolve();
//             } else if (stop_flag || id !== __id__) {
//                 reject("cancelled");
//                 return;
//             } else {
//                 requestAnimationFrame(checkTime);
//             }
//         }
//         checkTime(); // initial check
//     });
// }

// async function keyInputTest(key) {
//     window.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
//     window.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
//     await sleep(100);
// }

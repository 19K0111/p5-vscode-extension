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
        textAlign(CENTER, CENTER);
        textSize(32);
        // BEGIN
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[0].length; x++) {
                if (this.tiles[y][x] == 0) {
                    fill("#000000");
                } else {
                    fill("#ffffff");
                }
                rect(x * SCREEN_SIZE.WIDTH / this.tiles.length, y * SCREEN_SIZE.HEIGHT / this.tiles[0].length + MARGIN.y,
                    SCREEN_SIZE.WIDTH / this.tiles.length, SCREEN_SIZE.HEIGHT / this.tiles[0].length);
                fill("#000000");
                if (this.tiles[y][x] != 0) {
                    text(this.tiles[y][x], (x + 0.5) * SCREEN_SIZE.WIDTH / this.tiles.length,
                        (y + 0.5) * SCREEN_SIZE.HEIGHT / this.tiles.length + MARGIN.y);
                }
            }
        }
        // END
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
let stop_flag;

let sp = new SlidePuzzle();

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        state: new SPState(),
        savedFrameCount: 0,
    };
}

// p5.jsのsetup関数
function setup() {
    createCanvas(SCREEN_SIZE.WIDTH, SCREEN_SIZE.HEIGHT + MARGIN.y);
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
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 85, 50);
    slider.size(200);
    slider.elt.disabled = true;

    restart_button.mousePressed(() => {
        if (stop_flag) {
            stop_flag = !stop_flag;
            draw_button.html("stop");
        }
        if (!slider.elt.disabled) {
            slider.elt.disabled = true;
        }
        draw_button.elt.disabled = false;
        background(255);
        initializeVars();
        drawFlag = false;
        redraw();
    });

    draw_button.mousePressed(() => {
        stop_flag = !stop_flag;
        // stop: true, resume: false
        if (stop_flag) {
            frameRate(0);
            draw_button.html("resume");
            slider.elt.disabled = false;
            slider.attribute("min", 1);
            slider.attribute("max", frameCount);
            slider.value(frameCount);
            frames[frames.length - 1].savedFrameCount = frameCount;
            console.log(frameCount);

            if (save_frame.checked()) {
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
            draw_button.html("stop");
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

    });

    slider.input(() => {
        if (stop_flag) {
            background(255);
            drawFrame(frames[slider.value() - 1], slider.value());
        }
    })

    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
            case "snapshot":
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
                frameRate(30);
                break;
        }
    });
}

// p5.jsのdraw関数
function draw() {
    background("white");
    if (environment.stop_flag) {
        // stopしている(ボタンの表示がresumeになっている)とき
    } else {
        // resumeしている(ボタンの表示がstopになっている)とき
        if (frameCount <= frames.length) {
            // VS Codeから状態を受け取った場合の処理           
            frameRate(10); // 受け取った状態を早送りで描画
            drawFrame(frames[frameCount - 1], frameCount);
            if (frameCount === frames.length) {
                // 最後のフレームまで到達したら
                frameRate(0); // 早送りをやめる
            }
        } else {
            // ユーザーがキー入力やマウス操作をしているときの処理
            drawFrame();
            let _env = JSON.parse(JSON.stringify(environment));
            frames.push(_env); //  VS Codeに送信するための状態リストに追加
            frameRate(0); // 早送りをしていたら止める
        }
    }
}

function drawFrame(env = -1, fc = -1) {
    if (env === -1) {

    } else {
        // 引数のenv情報をもとにenvironmentを更新
        environment = JSON.parse(JSON.stringify(env));
        frameCount = fc; // フレームカウントを更新

        environment.state = new SPState(environment.state.tiles, environment.state.hole);
        console.log(environment);
    }
    environment.state.draw(); // 現在のパズルの状態をキャンバスに描画
}

// p5.jsのmousePressed関数
function mousePressed() {
    if (!stop_flag) {
        // クリックした座標からパズルに対応するx, yを計算
        let x = Math.floor(mouseX / SCREEN_SIZE.WIDTH * environment.state.tiles.length);
        let y = Math.floor((mouseY - MARGIN.y) / SCREEN_SIZE.HEIGHT * environment.state.tiles[0].length);
        // BEGIN
        // ex01.jsのmousePressed関数のBEGIN〜END内を貼り付ける

        // END
    }
}

// p5.jsのkeyPressed関数
async function keyPressed() {
    sp = new SlidePuzzle(); // パズルを解くためのインスタンスを生成
    if (!stop_flag) {
        // stopしていない(ボタンの表示がstopになっている)とき
        let x, y;
        if (key === "ArrowUp") {
            // BEGIN

            // END
        } else if (key === "ArrowDown") {
            // BEGIN

            // END
        } else if (key === "ArrowLeft") {
            // BEGIN

            // END
        } else if (key === "ArrowRight") {
            // BEGIN

            // END
        }
        // BEGIN
        // ex01.jsのmousePressed関数のBEGIN〜END内を貼り付ける

        // END
    }
    if (key == "r") {
        initializeVars();
        redraw();
    } else if (key == "s" && !stop_flag) {
        try {
            // BEGIN
            // awaitをつけて呼び出す

            // END
        } catch (e) {
            console.log(e);
        }
    }
}

// イベントマクロ
async function automaticallyMove() {
    if (sp.solve(environment.state, 40)) {
        // BEGIN
        console.log("Solved");
        for (let s of sp.getSolution().reverse()) {
            // 配列spから1つずつ取り出した要素s(SPVector型)に対する処理
            // s = {x: number, y: number}
            console.log(s);
            if (false /* 適切な条件に書き換える、以下同様 */) {
                await keyInputTest("ArrowUp");
            } else if (false) {
                await keyInputTest("ArrowRight");
            } else if (false) {
                await keyInputTest("ArrowDown");
            } else if (false) {
                await keyInputTest("ArrowLeft");
            }
        }
        // END
    } else {
        // 解が見つからなかったとき
        console.log("Failed");
    }
    vscode.postMessage({ command: "eventmacro" }); // イベントマクロを呼び出したことをVS Codeに通知
}

let __id__ = 0;
// 指定した時間だけ待機する関数
async function sleep(ms) { // ms: number
    const calledTime = Date.now();
    const targetTime = calledTime + ms;

    let id = ++__id__;

    return new Promise((resolve, reject) => {
        function checkTime() {
            if (Date.now() >= targetTime) {
                resolve();
            } else if (stop_flag || id !== __id__) {
                reject("cancelled");
                return;
            } else {
                requestAnimationFrame(checkTime);
            }
        }
        checkTime(); // initial check
    });
}

// キーボード入力をテストする関数
async function keyInputTest(key) { // key: string
    window.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
    await sleep(100); // 引数を100より大きくしても良い
}

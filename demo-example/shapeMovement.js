// スーパークラスとサブクラスの状態を保存する例題
// イベントマクロ：キーを一定時間押しっぱなしにして離す

/** スナップショットとして保存するクラス(スーパークラス) */
class Shape {
    /**
     * @param {number} x 中心のx座標
     * @param {number} y 中心のy座標
     * @param {number} w 幅
     * @param {number} h 高さ
     * @param {string} color 塗りつぶしの色
     * @param {string} strokeColor 枠線の色
     */
    constructor(x, y, w, h, color = "#FFFFFF", strokeColor = "#000000") {
        this._instance = this.constructor.name; // JSON形式のときに型の情報を失ってしまうため
        if (this.constructor === Shape) {
            throw new TypeError("Abstract class 'Shape' cannot be instantiated directly.");
        }
        this.x = x; // 中心のx座標
        this.y = y; // 中心のy座標
        this.w = w; // 幅
        this.h = h; // 高さ
        this.color = color; // 塗りつぶしの色
        this.strokeColor = strokeColor; // 枠線の色
    }

    /** スーパークラスはAbstractクラスなのでインスタンスを作ろうとするとエラー
     * @param {Shape} s コピー元のインスタンス
     * @returns {Shape} コピーしたインスタンス
     */
    static copy(s) {
        // ポリモーフィズムによりインスタンスの型によって分岐
        if (s._instance === Circle.prototype.constructor.name) {
            return Circle.copy(s);
        } else if (s._instance === Rectangle.prototype.constructor.name) {
            return Rectangle.copy(s);
        } // サブクラスを追加したら同様に追加する
        // else if (s._instance === ...) { ... }

        // インスタンスがスーパークラスの場合はエラー
        throw new TypeError("Method 'copy' must be implemented.");
    }

    /** drawメソッドはサブクラスで実装する */
    draw() {
        throw new TypeError("Method 'draw' must be implemented.");
    }
}

/** スナップショットとして保存するクラス(サブクラス) */
class Circle extends Shape {
    /**
     * @param {number} x 中心のx座標
     * @param {number} y 中心のy座標
     * @param {number} r 半径
     * @param {string} color 塗りつぶしの色
     * @param {string} strokeColor 枠線の色
     */
    constructor(x, y, r, color = "#FFFFFF", strokeColor = "#000000") {
        super(x, y, r * 2, r * 2, color, strokeColor);
        this.r = r; // 半径
    }

    /** スナップショットの保存や復元のためのcopyメソッド
     * @param {Circle} c コピー元のインスタンス
     * @returns {Circle} コピーしたインスタンス
     */
    static copy(c) {
        return new Circle(c.x, c.y, c.r, c.color, c.strokeColor);
    }

    /** Circleクラスのdrawメソッド */
    draw() {
        push();
        fill(this.color);
        stroke(this.strokeColor);
        ellipse(this.x, this.y, this.r * 2);
        pop();
    }
}

/** スナップショットとして保存するクラス(サブクラス) */
class Rectangle extends Shape {
    /**
     * @param {number} x 中心のx座標
     * @param {number} y 中心のy座標
     * @param {number} w 幅
     * @param {number} h 高さ
     * @param {string} color 塗りつぶしの色
     * @param {string} strokeColor 枠線の色
     */
    constructor(x, y, w, h, color = "#FFFFFF", strokeColor = "#000000") {
        super(x, y, w, h, color, strokeColor);
    }

    /** スナップショットの保存や復元のためのcopyメソッド
     * @param {Rectangle} r コピー元のインスタンス
     * @returns {Rectangle} コピーしたインスタンス
     */
    static copy(r) {
        return new Rectangle(r.x, r.y, r.w, r.h, r.color, r.strokeColor);
    }

    /** Rectangleクラスのdrawメソッド */
    draw() {
        push();
        fill(this.color);
        stroke(this.strokeColor);
        rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
        pop();
    }
}

// サブクラスを追加する場合は、同様にクラスを定義し、copyメソッド、drawメソッドを実装する
// スーパークラスのcopyメソッドに追加することを忘れないようにする


const MARGIN = { x: 10, y: 40 };
const BOX = { width: 30, height: 40 };
const STAGE = { width: 300, height: 400 };
const DEBUG = true;
const FPS = 30; // 1秒間に描画する回数
const SCREEN_SIZE = 1300; // 実行画面のサイズ

let canvas;
let environment; // スナップショットとして保存するオブジェクト
let restart_button;
let draw_button;
let ff_button;
let save_frame;
let frames; // スナップショットを保存する配列 environmentの集合
let slider;
let myfont;

let stop_flag;

/** p5.jsのpreload関数
 * @summary text関数で描画する文字のフォントを指定する
 */
function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf");
}

/** 変数の初期化 */
function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        obj: [new Circle(100, 100, 10)], // スナップショットとして保存するオブジェクト
        // reset_flag: false,
        // stop_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    showVars(environment);
}

/** 変数の値を実行画面に表示する関数
 * @param {object} env - 表示する変数のオブジェクト
 */
function showVars(env) {
    if (DEBUG) {
        textSize(20);
        textAlign(LEFT, CENTER);
        push();
        // translate(-SCREEN_SIZE/2, -SCREEN_SIZE/2 + BOX.height);
        fill(255);
        strokeWeight(0);
        rect(MARGIN.x, 2 * MARGIN.y + 370, 250, 200); // 座標は適宜変更する
        fill(0);
        let o = Object.entries(env);
        // environmentのキーの個数をforループで回して、値を表示する
        for (let e = 0; e < Object.keys(env).length; e++) {
            // ネストになっているものは、[Object object]になってしまうのであくまでも参考程度に
            // 開発者ツールで変数を確認することを推奨
            text(`${o[e][0]}: ${o[e][1]}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * e); // 座標は適宜変更する
        }
        text(`frameCount: ${frameCount}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * Object.keys(env).length); // 座標は適宜変更する
        pop();
    }
}

/** p5.jsのsetup関数 */
function setup() {
    createCanvas(SCREEN_SIZE / 2, SCREEN_SIZE / 2);
    textFont(myfont);
    background(255);
    frameRate(FPS);
    initializeVars();
    showVars(environment);

    // GUI部品の定義
    restart_button = createButton("restart");
    restart_button.position(MARGIN.x + 0, 10);
    draw_button = createButton("stop");
    draw_button.position(MARGIN.x + 70, 10);
    ff_button = createButton("fast forward");
    ff_button.position(MARGIN.x + 150, 10);
    ff_button.elt.disabled = true;
    save_frame = createCheckbox("save frame");
    save_frame.position(MARGIN.x + 250, 10);
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 350, 10);
    slider.size(200);
    slider.elt.disabled = true;

    // restartボタンが押されたときの処理
    restart_button.mousePressed(() => {
        // push();
        // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
        if (stop_flag) {
            stop_flag = !stop_flag;
            draw_button.html("stop");
        }
        if (!slider.elt.disabled) {
            slider.elt.disabled = true;
        }
        draw_button.elt.disabled = false;
        // ff_button.elt.disabled = false;
        frameRate(0);
        background(255);
        initializeVars();
        drawFlag = false;
        showVars(environment);
        frameRate(FPS);
        // pop();
    });

    // resume/stopボタンが押されたときの処理
    draw_button.mousePressed(() => {
        stop_flag = !stop_flag;
        // stop: true, start: false
        if (stop_flag) {
            frameRate(0);
            draw_button.html("resume");
            // ff_button.elt.disabled = true;
            slider.elt.disabled = false;
            slider.attribute("min", 1);
            slider.attribute("max", frameCount);
            slider.value(frameCount);
            frames[frames.length - 1].savedFrameCount = frameCount;
            // environment.savedFrameCount = frameCount;
            console.log(frameCount);

            showVars(environment);
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
            frameRate(FPS);
            draw_button.html("stop");
            // ff_button.elt.disabled = false;
            slider.elt.disabled = true;
            while (frames.length > frameCount) {
                // スナップショットの上書き
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

    // スライダーの値が変わったときの処理
    slider.input(() => {
        if (/*environment.*/stop_flag) {
            // push();
            // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
            drawFrame(frames[slider.value() - 1], slider.value());
            // image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            // pop();
        }
    })

    frameRate(0);

    // VS Codeからのメッセージを受信したときに呼び出される
    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
            // スナップショットが送られたとき
            case "snapshot":
                // frameCount, save_frame_flag, environment, framesが送られてくる
                if (message.frameCount !== undefined) {
                    // frameCount = message.frameCount;
                }
                if (Object.keys(message.environment).length !== 0) {
                    environment = message.environment;
                    for (let i = 0; i < message.environment.obj.length; i++) {
                        environment.obj[i] = Shape.copy(message.environment.obj[i]); // インスタンス化
                    }
                }
                if (message.save_frame_flag !== undefined) {
                    if (message.save_frame_flag !== save_frame.checked()) {
                        save_frame.checked(message.save_frame_flag);
                    }
                }
                if (message.frames.length > 0) {
                    frames = message.frames;
                    for (let i = 0; i < message.frames.length; i++) {
                        for (let j = 0; j < message.frames[i].obj.length; j++) {
                            frames[i].obj[j] = Shape.copy(message.frames[i].obj[j]); // インスタンス化
                        }
                    }
                    frameCount = frames.length; // スナップショット取得後、続きから実行
                }
                frameRate(FPS);
                break;
        }
    });
}

/** p5.jsのdraw関数 */
function draw() {
    // push();
    // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);

    background(255);
    if (stop_flag) {
        // stop
        // drawFrame(slider.value());
        if (slider.value() < frameCount && frames.length > 0) {
            // drawFrame(frames[frames.length - 1], slider.value() + 1);
        }
    } else {
        // start
        if (frameCount <= frames.length && false) { // 早送り("&& false" を消す)
            frameRate(FPS);
            drawFrame(frames[frameCount - 1], frameCount);
            // image(frames[frameCount - 1], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            if (frameCount === frames.length) {
                // frameRate(0);
            }
        } else {
            frameRate(FPS);
            drawFrame();
            // environmentをJSON形式に一度変換する
            // JSON形式に変換しないとenvironmentが参照渡しになり、副作用の原因になる
            let _env = JSON.parse(JSON.stringify(environment));
            for (let i = 0; i < _env.obj.length; i++) {
                // Shapeオブジェクトが実行画面上に複数ある場合を考慮してforループで回す
                _env.obj[i] = Shape.copy(_env.obj[i]);
            }
            frames.push(_env); // スナップショットとして配列に追加する
        }
    }
    // drawFrame();
    // pop();
}

/**
 * 
 * @param {object | number} env スナップショットのオブジェクト
 * @param {number} fc フレームカウント
 */
function drawFrame(env = -1, fc = -1) {
    rect(MARGIN.x, MARGIN.y, STAGE.width, SCREEN_SIZE - 20);
    rect(MARGIN.x, MARGIN.y, STAGE.width, STAGE.height);
    if (env === -1) {
        // ここに描画処理を記述
        for (let i = 0; i < environment.obj.length; i++) {
            environment.obj[i].draw();

            // draw内部でキーが押されているかを判定することで押しっぱなしの挙動になる
            // keyIsDown関数は押されているかを判定するp5.jsの関数
            // EventMacro.keyPressingは、イベントマクロ実行中にキーとして指定したkey(string)が押されているかを管理している
            if (keyIsDown(UP_ARROW) || EventMacro.keyPressing["ArrowUp"]) {
                environment.obj[0].y -= 10;
            }
            if (keyIsDown(RIGHT_ARROW) || EventMacro.keyPressing["ArrowRight"]) {
                environment.obj[0].x += 10;
            }
            if (keyIsDown(DOWN_ARROW) || EventMacro.keyPressing["ArrowDown"]) {
                environment.obj[0].y += 10;
            }
            if (keyIsDown(LEFT_ARROW) || EventMacro.keyPressing["ArrowLeft"]) {
                environment.obj[0].x -= 10;
            }
        }
    } else {
        // スナップショットの復元時に早送りで描画するとき、スライダーを使って描画し直すときに記述
        // 引数のenv、fcからスナップショットを復元する
        environment = JSON.parse(JSON.stringify(env));
        frameCount = fc;
        for (let i = 0; i < environment.obj.length; i++) {
            environment.obj[i] = Shape.copy(environment.obj[i]);
            environment.obj[i].draw();
        }
        // frameRate(1);
        // redraw();
    }
    showVars(environment);
}

/** p5.jsのmouseMoved関数 */
function mouseMoved(event) {
    // console.log(event);
    if (DEBUG) {
        // マウスの座標を表示する
        push();
        // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        noStroke();
        fill("#ffffff");
        rect(350, 120, 300, 50);
        fill("#000000");
        text(`(${mouseX}, ${mouseY})`, 350, 150);
        strokeWeight(1);
        pop();
    }
    // console.log(get(mouseX, mouseY));
}

/** p5.jsのkeyPressed関数 */
async function keyPressed() {
    if (key == "r") {
        // リセット
        initializeVars();
    } else if (key == "t") {
        // イベントマクロを実行
        try {
            await automaticallyMove(); // イベントマクロ
        } catch (e) {
            console.log(e);
        }
    }
}

// イベントマクロの定義
/** イベントマクロの関数
 * @summary 自動で矢印キーを押しっぱなしにする
 * @returns {Promise<void>} Promiseオブジェクト
 */
async function automaticallyMove() {
    // リセットしてから、矢印キーの右と下をフレームカウントが15になるまで押しっぱなしにする
    EventMacro.keyInputTest("r");
    await EventMacro.keyDownTest("ArrowDown");
    await EventMacro.keyDownTest("ArrowRight");
    await EventMacro.waitForFrameCounts(15);
    // console.log(EventMacro.keyPressing["ArrowDown"]);
    await EventMacro.keyUpTest("ArrowDown");
    await EventMacro.keyUpTest("ArrowRight");
    // console.log(EventMacro.keyPressing["ArrowDown"]);
}

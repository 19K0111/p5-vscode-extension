// スナップショットとして保存するクラス
class MyClass {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    // スナップショットの保存や復元のためのcopyメソッド
    static copy(obj) {
        return new MyClass(obj.name, obj.value);
    }

    draw() {
        let chr = Math.floor(frameCount / 15) % this.name.length;
        text(this.name.substring(chr, chr + 1), 100, 100 * this.value);
    }
}



const MARGIN = { x: 10, y: 40 };
const BOX = { width: 30, height: 40 };
const STAGE = { width: 300, height: 400 };
const DEBUG = true;
const FPS = 30; // 1秒間に描画する回数
const SCREEN_SIZE = 1300; // 実行画面のサイズ

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


function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf");
}

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        obj: [new MyClass("Taro", 1), new MyClass("Hanako", 2)], // スナップショットとして保存するオブジェクト
        // reset_flag: false,
        // stop_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    showVars(environment);
}

// 変数の値を実行画面に表示する関数
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
        for (let e = 0; e < Object.keys(env).length; e++) {
            text(`${o[e][0]}: ${o[e][1]}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * e); // 座標は適宜変更する
        }
        text(`frameCount: ${frameCount}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * Object.keys(env).length); // 座標は適宜変更する
        pop();
    }
}

function setup() {
    createCanvas(SCREEN_SIZE, SCREEN_SIZE);
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

    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
            case "snapshot":
                if (message.frameCount !== undefined) {
                    // frameCount = message.frameCount;
                }
                if (Object.keys(message.environment).length !== 0) {
                    environment = message.environment;
                    for (let i = 0; i < message.environment.obj.length; i++) {
                        environment.obj[i] = MyClass.copy(message.environment.obj[i]);
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
                            frames[i].obj[j] = MyClass.copy(message.frames[i].obj[j]);
                        }
                    }
                    frameCount = frames.length; // スナップショット取得後、続きから実行
                }
                frameRate(FPS);
                break;
        }
    });
}

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
            let _env = JSON.parse(JSON.stringify(environment));
            for (let i = 0; i < _env.obj.length; i++) {
                _env.obj[i] = MyClass.copy(_env.obj[i]);
            }
            frames.push(_env);
        }
    }
    // drawFrame();
    // pop();
}

function drawFrame(env = -1, fc = -1) {
    rect(MARGIN.x, MARGIN.y, STAGE.width, SCREEN_SIZE - 20);
    rect(MARGIN.x, MARGIN.y, STAGE.width, STAGE.height);
    if (env === -1) {
        // ここに描画処理を記述
        for (let i = 0; i < environment.obj.length; i++) {
            environment.obj[i].draw();
        }
    } else {
        // スナップショットの復元時に早送りで描画するとき、スライダーを使って描画し直すときに記述
        environment = JSON.parse(JSON.stringify(env));
        frameCount = fc;
        for (let i = 0; i < environment.obj.length; i++) {
            environment.obj[i] = MyClass.copy(environment.obj[i]);
            environment.obj[i].draw();
        }
        // frameRate(1);
        // redraw();
    }
    showVars(environment);
}

function mouseMoved(event) {
    // console.log(event);
    if (DEBUG) {
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

async function keyPressed() {
    if (key == "r") {
        initializeVars();
    } else if (key == "t") {
        try {
            await myEventMacro();
        } catch (e) {
            console.log(e);
        }
    }
}

async function myEventMacro() {
    await EventMacro.keyInputTest("r");
}

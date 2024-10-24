// Saving variables each frame to the server

class Ball {
    // using vector
    constructor(x, y, r, vx, vy, m = -1, e = 1) {
        this.location = createVector(x, y);
        this.radius = r;
        this.velocity = createVector(vx, vy);
        this.mass = m < 0 ? r ** 2 : m;
        this.e = e;
        // this.energy = 0.5 * this.mass * (this.velocity.x ** 2 + this.velocity.y ** 2)
        //     + this.mass * Ball.ACCELERATION() * (STAGE.height - this.location.y);
    }

    static copy(ball) {
        return new Ball(ball.location.x, ball.location.y, ball.radius, ball.velocity.x, ball.velocity.y, ball.mass, ball.e);
    }

    static ACCELERATION() {
        return 1.0;
    }

    static vector = false;

    update() {
        this.velocity.y += Ball.ACCELERATION();
        this.location.add(this.velocity);
    }

    draw() {
        ellipse(this.location.x, this.location.y, this.radius * 2, this.radius * 2);
        if (Ball.vector) {
            this.drawArrow(this.location, this.velocity, color(0, 0, 255));
        }
    }

    drawArrow(base, vec, color) {
        const ARROW_SIZE = 3;
        push();
        stroke(color);
        strokeWeight(3);
        fill(color);
        translate(base.x, base.y);
        line(0, 0, vec.x * ARROW_SIZE, vec.y * ARROW_SIZE);
        rotate(vec.heading());
        let arrowSize = 7;
        translate(vec.mag() * ARROW_SIZE - arrowSize, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }
}



const MARGIN = { x: 10, y: 40 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };
const STAGE = { width: 300, height: 400 };
const DEBUG = true;
const FPS = 30;
const SCREEN_SIZE = 1300;

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
        balls: [new Ball(100 + MARGIN.x, 100 + MARGIN.y, 10, 2, 1)],
        // reset_flag: false,
        // stop_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    showVars(environment);
}

function showVars(env) {
    if (DEBUG) {
        textSize(20);
        textAlign(LEFT, CENTER);
        push();
        // translate(-SCREEN_SIZE/2, -SCREEN_SIZE/2 + BOX.height);
        fill(255);
        strokeWeight(0);
        rect(MARGIN.x, 2 * MARGIN.y + 370, 250, 200);
        fill(0);
        let o = Object.entries(env);
        for (let e = 0; e < Object.keys(env).length; e++) {
            text(`${o[e][0]}: ${o[e][1]}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * e);
        }
        text(`frameCount: ${frameCount}`, 2 * MARGIN.x, 2 * MARGIN.y + STAGE.height + BOX.width * Object.keys(env).length);
        // ellipse(MARGIN.x,MARGIN.y+STAGE.height+BOX.width,SCREEN_SIZE,SCREEN_SIZE/2);
        pop();
    }
}

function setup() {
    createCanvas(SCREEN_SIZE, SCREEN_SIZE);
    textFont(myfont);
    // canvas = createFramebuffer();
    background(255);
    frameRate(FPS);
    initializeVars();
    showVars(environment);

    // bubbleSortAnimation(environment.array, environment.i, environment.j);
    // showVars(environment);

    restart_button = createButton("restart");
    restart_button.position(MARGIN.x + 0, 10);
    draw_button = createButton("stop");
    draw_button.position(MARGIN.x + 70, 10);
    ff_button = createButton("fast forward");
    ff_button.position(MARGIN.x + 120, 10);
    ff_button.elt.disabled = true;
    save_frame = createCheckbox("save frame");
    save_frame.position(MARGIN.x + 220, 10);
    // save_frame.elt.children[0].children[0].disabled = true;
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 350, 10);
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
        frameRate(0);
        background(255);
        initializeVars();
        drawFlag = false;
        showVars(environment);
        frameRate(FPS);
        // pop();
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

            showVars(environment);
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
            frameRate(FPS);
            draw_button.html("stop");
            // ff_button.elt.disabled = false;
            slider.elt.disabled = true;
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
            // translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
            drawFrame(frames[slider.value() - 1], slider.value());
            // image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            // pop();
        }
    })

    /* サーバからframecountを受け取る */
    // socket.on("sendFrameCount", function (data) {
    //     environment.savedFrameCount = data;
    //     frameRate(FPS);
    // });
    /* サーバからenvironmentを受け取る */
    // socket.on("sendEnvironment", function (data) {
    //     if (!/*environment.*/stop_flag) {
    //         if (Object.keys(data).length !== 0) {
    //             environment = data;
    //             for (let i = 0; i < environment.balls.length; i++) {
    //                 let t = new Ball();
    //                 t.x = environment.balls[i].x;
    //                 t.y = environment.balls[i].y;
    //                 t.r = environment.balls[i].r;
    //                 t.vx = environment.balls[i].vx;
    //                 t.vy = environment.balls[i].vy;
    //                 t.e = environment.balls[i].e;
    //                 environment.balls[i] = t;
    //             }
    //         }
    //         frameRate(FPS);
    //     }
    // });

    /* サーバからframeを受け取る */
    // socket.on("sendFrame", function (data) {
    //     if (!/*environment.*/stop_flag) {
    //         frames = [];
    //         for (let i = 0; i < data.length; i++) {
    //             base64ToP5Image(data[i], (p5Image) => {
    //                 frames.push(p5Image);
    //             });
    //         }
    //         frameRate(FPS);
    //     }
    // });

    /* サーバからsave_frameを受け取る */
    // socket.on("sendFlag", function (data) {
    //     save_frame.checked(data);
    // });
    // console.log(socket);
    frameRate(0);

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
                    for (let i = 0; i < message.environment.balls.length; i++) {
                        environment.balls[i] = Ball.copy(message.environment.balls[i]);
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
                        for (let j = 0; j < message.frames[i].balls.length; j++) {
                            frames[i].balls[j] = Ball.copy(message.frames[i].balls[j]);
                        }
                    }
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
    if (/*environment.*/stop_flag) {
        // stop
        // drawFrame(slider.value());
        if (slider.value() < frameCount && frames.length > 0) {
            // drawFrame(frames[frames.length - 1], slider.value() + 1);
            // image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        }
    } else {
        // start
        if (frameCount <= frames.length) {
            frameRate(FPS);
            drawFrame(frames[frameCount - 1], frameCount);
            // image(frames[frameCount - 1], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            if (frameCount === frames.length) {
                // frameRate(0);
            }
        } else {
            // canvas.begin();
            // fill(128, 255, 255);
            frameRate(FPS);
            drawFrame();
            // canvas.end();
            // frames.push(canvas.get());
            let _env = JSON.parse(JSON.stringify(environment));
            // let _env = environment.balls;
            for (let i = 0; i < _env.balls.length; i++) {
                _env.balls[i] = Ball.copy(_env.balls[i]);
            }
            frames.push(_env);
            // frames.push(environment);
            // image(canvas, -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        }
    }
    // drawFrame();
    // pop();
}

function drawFrame(env = -1, fc = -1) {
    rect(MARGIN.x, MARGIN.y, STAGE.width, SCREEN_SIZE - 20);
    rect(MARGIN.x, MARGIN.y, STAGE.width, STAGE.height);
    if (env === -1) {
        calculate();
    } else {
        environment = JSON.parse(JSON.stringify(env));
        frameCount = fc;
        // console.log(env);
        for (let i = 0; i < environment.balls.length; i++) {
            environment.balls[i] = new Ball(environment.balls[i].location.x, environment.balls[i].location.y, environment.balls[i].radius, environment.balls[i].velocity.x, environment.balls[i].velocity.y, environment.balls[i].mass, environment.balls[i].e);
            environment.balls[i].draw();
        }
        // frameRate(1);
        // redraw();
    }
    showVars(environment);
}

function calculate() {
    // vector version
    for (let i = 0; i < environment.balls.length; i++) {
        environment.balls[i].update();
        if (environment.balls[i].location.x - environment.balls[i].radius <= MARGIN.x) {
            environment.balls[i].velocity.x *= -1;
            environment.balls[i].location.x = environment.balls[i].radius + MARGIN.x;
        } else if (STAGE.width + MARGIN.x <= environment.balls[i].location.x + environment.balls[i].radius) {
            environment.balls[i].velocity.x *= -1;
            environment.balls[i].location.x = STAGE.width - environment.balls[i].radius + MARGIN.x;
        }
        if (environment.balls[i].location.y - environment.balls[i].radius <= MARGIN.y) {
            environment.balls[i].velocity.y *= -1;
            environment.balls[i].location.y = environment.balls[i].radius + MARGIN.y;
        } else if (STAGE.height + MARGIN.y <= environment.balls[i].location.y + environment.balls[i].radius) {
            environment.balls[i].velocity.y = -(environment.balls[i].velocity.y + 1);
            environment.balls[i].location.y = STAGE.height - environment.balls[i].radius + MARGIN.y;

        }
        for (let j = i + 1; j < environment.balls.length; j++) {
            let a = environment.balls[i];
            let b = environment.balls[j];
            let ab = p5.Vector.sub(b.location, a.location);
            let gap = ab.mag() - a.radius - b.radius;
            if (gap < 0) {
                let len = -gap;
                let normal = ab.copy().normalize();
                a.location.add(normal.copy().mult(len * (-b.mass / (a.mass + b.mass))));
                b.location.add(normal.copy().mult(len * (a.mass / (a.mass + b.mass))));
                let as = a.velocity.copy().dot(normal);
                let avx = normal.copy().mult(as);
                let avy = a.velocity.copy().sub(avx);
                let bs = b.velocity.copy().dot(normal);
                let bvx = normal.copy().mult(bs);
                let bvy = b.velocity.copy().sub(bvx);

                let e = 0.8;
                let as2 = ((a.mass * as + b.mass * bs) - (e * b.mass * (as - bs))) / (a.mass + b.mass);
                let bs2 = ((a.mass * as + b.mass * bs) + (e * a.mass * (as - bs))) / (a.mass + b.mass);
                a.velocity = avy.copy().add(normal.copy().mult(as2));
                b.velocity = bvy.copy().add(normal.copy().mult(bs2));
            }
        }
        environment.balls[i].draw();
    }
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
        // board = new Board([]);
        // gameOverFlag = false;
    } else if (key == "t") {
        try {
            await ballsTest(5);
        } catch (e) {
            console.log(e);
        }
    } else if (key == "b") {
        let b = new Ball(100 + MARGIN.x, 100 + MARGIN.y, 10, 2, 1);
        environment.balls.push(b);
    } else if (key == "v") {
        Ball.vector = !Ball.vector;
    }
}

// 指定した時間(ミリ秒)だけ待つ
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitForMilliseconds(ms) {
    return waitForFrameCounts(ms / 1000 * frameRate());
}

async function waitForFrameCounts(f) {
    let start = frameCount;
    while (frameCount - start < f) { }
    return;
}

// キーkeyの入力をテストする
async function keyInputTest(key) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
    window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    await sleep(100);
}

async function ballsTest(n) {
    for (let i = 0; i < n; i++) {
        keyInputTest("b");
        waitForFrameCounts(60);
    }
}

// function imageToBase64(p5Image) {
//     // Create an offscreen canvas
//     let offscreenCanvas = document.createElement('canvas');
//     offscreenCanvas.width = p5Image.width;
//     offscreenCanvas.height = p5Image.height;
//     let context = offscreenCanvas.getContext('2d');

//     // Draw the p5.Image onto the offscreen canvas
//     context.drawImage(p5Image.canvas, 0, 0, p5Image.width, p5Image.height);

//     // Get the data URL of the offscreen canvas
//     let dataURL = offscreenCanvas.toDataURL('image/png'); // You can change 'image/png' to 'image/jpeg' if you prefer JPEG

//     return dataURL;
// }

// function imagesToBase64Array(p5Images) {
//     return p5Images.map(image => imageToBase64(image));
// }
// function base64ToP5Image(base64, callback) {
//     let img = loadImage(base64);
//     callback(img);
// }

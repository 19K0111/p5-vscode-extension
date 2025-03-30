// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const vscode = acquireVsCodeApi();
(function () {

    const oldState = /** @type {{ count: number} | undefined} */ (vscode.getState());

    console.log('Initial state', oldState);


    if (false) {
        // Update state
        vscode.setState({ count: currentCount });

        // Send a message to the extension
        vscode.postMessage({
            command: 'alert',
            text: 'Error: ' + ""
        });
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'refactor':
                break;
        }
    });
}());

/** 入力を自動化するイベントマクロクラス */
class EventMacro {
    /** 指定した時間(ミリ秒)だけ待つ 
     * @param time {number} 待つ時間(ミリ秒)
     * @returns {Promise<void>} Promiseオブジェクト
     * @example
     * // 1000ミリ秒(1秒)待つ
     * await EventMacro.sleep(1000);
     */
    static sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

    /** keyに対応するキーが押されているかどうかを取得する */
    static keyPressing = {};

    /** キーkeyの入力をテストする 
     * @param key {string} キーの名前
     * @example
     * // "Enter"キーを押す
     * await EventMacro.keyInputTest("Enter");
     */
    static async keyInputTest(key) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
        window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
        await EventMacro.sleep(100);
    }

    /** キーkeyを押し続けるテスト 
     * @param key {string} キーの名前
     * @example
     * // "Enter"キーを押し続ける
     * await EventMacro.keyDownTest("Enter");
     */
    static async keyDownTest(key) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
        EventMacro.keyPressing[key] = true;
    }

    /** キーkeyを離すテスト
     * @param key {string} キーの名前
     * @example
     * // "Enter"キーを離す
     * await EventMacro.keyUpTest("Enter");
     */
    static async keyUpTest(key) {
        window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
        EventMacro.keyPressing[key] = false;
    }

    /** マウスを座標(x, y)に移動するテスト
     * @param x {number} x座標
     * @param y {number} y座標
     * @example
     * // (100, 200)にマウスを移動する
     * await EventMacro.mouseMoveTest(100, 200);
     */
    static async mouseMoveTest(x, y) {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
        await EventMacro.sleep(100);
    }

    /** 座標(x, y)でマウスクリックするテスト
     * @param x {number} x座標
     * @param y {number} y座標
     * @example
     * // (100, 200)でマウスクリックする
     * await EventMacro.mouseInputTest(100, 200);
     */
    static async mouseInputTest(x, y) {
        window.dispatchEvent(new PointerEvent("click", { clientX: x, clientY: y }));
        await EventMacro.sleep(100);
    }


    static __id__ = 0;
    /** 指定したフレームカウントまで待つ
     * @param f {number} 待つフレーム数
     * @returns {Promise<void>} Promiseオブジェクト
     * @example
     * // 60フレーム待つ
     * await EventMacro.waitForFrameCounts(60);
     */
    static async waitForFrameCounts(f) {
        const calledFrameCount = frameCount;
        const targetFrameCount = frameCount + f;

        let id = ++EventMacro.__id__;

        return new Promise((resolve, reject) => {
            function checkFrameCount() {
                if (frameCount >= targetFrameCount) {
                    resolve();
                } else if (frameCount < calledFrameCount || id !== EventMacro.__id__) {
                    reject("cancelled");
                    return;
                } else {
                    requestAnimationFrame(checkFrameCount);
                }
            }
            checkFrameCount(); // initial check
        });
    }
}

// 画像をスナップショットとして利用する場合に使用するスナップショットクラス
/* ライブラリではなく、関数をユーザのソースコード内に実装して呼び出している例は、
 * ブラウザ版のuserManuallySort.js等のソースコードを参照
 * https://github.com/19K0111/p5-Blockly-live-environment/blob/main/demo-example/userManuallySort.js
 * ライブラリ化しているが、今回実装した例題プログラムでは登場しない
 * EventMacroクラスと同様にクラスメソッドとして呼び出せば動作する実装となっている
 */
class Snapshot {
    /** imageをBase64に変換する
     * @param p5Image {p5.Image} p5.Imageオブジェクト
     * @returns {string} Base64形式の画像データURL
     */
    static imageToBase64(p5Image) {
        // Create an offscreen canvas
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = p5Image.width;
        offscreenCanvas.height = p5Image.height;
        let context = offscreenCanvas.getContext('2d');

        // Draw the p5.Image onto the offscreen canvas
        context.drawImage(p5Image.canvas, 0, 0, p5Image.width, p5Image.height);

        // Get the data URL of the offscreen canvas
        let dataURL = offscreenCanvas.toDataURL('image/png'); // You can change 'image/png' to 'image/jpeg' if you prefer JPEG

        return dataURL;
    }

    /** imageの配列Base64の配列に変換する
     * @param p5Images {p5.Image[]} p5.Imageオブジェクトの配列
     * @returns {string[]} Base64形式の画像データURLの配列
     */
    static imagesToBase64Array(p5Images) {
        return p5Images.map(image => imageToBase64(image));
    }

    /** Base64をp5.Imageに変換する
     * @param base64 {string} Base64形式の画像データURL
     * @param callback {function} コールバック関数
     * @example
     * // Base64をp5.Imageに変換する
     * Snapshot.base64ToP5Image(base64, function(p5Image) {
     *     // p5.Imageを使用する処理
     *     frames.push(p5Image);
     * });
     */
    static base64ToP5Image(base64, callback) {
        let img = loadImage(base64);
        callback(img);
    }
}

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

// 入力を自動化するイベントマクロクラス
class EventMacro {
    // 指定した時間(ミリ秒)だけ待つ
    static sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

    // キーkeyの入力をテストする
    static async keyInputTest(key) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
        window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
        await EventMacro.sleep(100);
    }

    // マウスを座標(x, y)に移動するテスト
    static async mouseMoveTest(x, y) {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
        await EventMacro.sleep(100);
    }

    // 座標(x, y)でマウスクリックするテスト
    static async mouseInputTest(x, y) {
        window.dispatchEvent(new PointerEvent("click", { clientX: x, clientY: y }));
        await EventMacro.sleep(100);
    }


    static __id__ = 0;
    // 指定したフレームカウントまで待つ
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
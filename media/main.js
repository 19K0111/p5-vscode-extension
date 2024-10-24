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

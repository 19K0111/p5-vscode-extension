// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { io, Socket } from "socket.io-client";

const APP_NAME = "p5-live-preview";

let socket: Socket
let intervalID: number = -1

// using for the snapshots of program states
let frameCount = 0;
let save_frame_flag = true;
let environment = {};
let frames: any = [];

let counter = { snapshot: 0, eventmacro: 0 };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let configuration = vscode.workspace.getConfiguration(APP_NAME);

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld" is now active!');
    socket = io("http://localhost:3000")
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // const disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
    //     // The code you place here will be executed every time your command is executed
    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World from helloworld!');
    // });

    // context.subscriptions.push(disposable);

    vscode.workspace.onDidChangeTextDocument(
        (event: vscode.TextDocumentChangeEvent) => {
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) return;

            const text = activeEditor.document.getText();
            console.log("onDidChangeTextDocument");

            if (ExecutionPanel.currentPanel) {
                if (intervalID != -1) clearInterval(intervalID);
                intervalID = Number(setTimeout(() => {
                    // vscode.window.showInformationMessage("hello world from onDidChange");
                    // socket.emit('editor_to_server', text);
                    ExecutionPanel.currentPanel?.sendHTML(text);
                    vscode.window.showInformationMessage(`re-executingDelay: ${vscode.workspace.getConfiguration(APP_NAME)["re-executingDelay"]}`);
                }, Number(vscode.workspace.getConfiguration(APP_NAME)["re-executingDelay"])));
            }

        }
    );

    context.subscriptions.push(vscode.commands.registerCommand('p5.run', () => {
        ExecutionPanel.createOrShow(context.extensionUri);
        ExecutionPanel.currentPanel?.sendHTML(vscode.window.activeTextEditor?.document.getText() || '');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('p5.reset', () => {
        frameCount = 0;
        save_frame_flag = true;
        environment = {};
        frames = [];
        vscode.window.showInformationMessage(`Reset snapshots.`);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('p5.counter.show', () => {
        let questionnaireUrl = `https://docs.google.com/forms/d/e/1FAIpQLScmcH1dyPlF06Jh300h8Gm6kr2p25V2CVD4CfUM2_GFjvVsTg/viewform?usp=pp_url&entry.1402000142=${counter.snapshot}&entry.968224659=${counter.eventmacro}`;
        vscode.window.showInformationMessage(`snapshot: ${counter.snapshot}, eventmacro: ${counter.eventmacro}`, `Answer a questionnaire`).then((value) => {
            if (value) {
                vscode.env.openExternal(vscode.Uri.parse(questionnaireUrl));
            }
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('p5.counter.reset', () => {
        const message = vscode.window.showInformationMessage(`Are you sure you want to reset the counter?`, { modal: true }, { title: "Yes", isCloseAffordance: false }, { title: "No", isCloseAffordance: true });
        message.then((value) => {
            if (value?.title === "Yes") {
                counter.snapshot = 0;
                counter.eventmacro = 0;
                vscode.window.showInformationMessage(`Reset the counter.`);
            }
        });
    }));

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(ExecutionPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for local resources
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                ExecutionPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}



// This method is called when your extension is deactivated
export function deactivate() {
    //    if (!socket) {
    //        return undefined;
    //    }
    if (socket.connected) {
        socket.disconnect();
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}


class ExecutionPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: ExecutionPanel | undefined;

    public static readonly viewType = 'p5Preview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (ExecutionPanel.currentPanel) {
            ExecutionPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ExecutionPanel.viewType,
            'p5.js Preview',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        ExecutionPanel.currentPanel = new ExecutionPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ExecutionPanel.currentPanel = new ExecutionPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view
        // this._panel.onDidChangeViewState(
        //     e => {
        //         if (this._panel.visible) {
        //             this._update();
        //         }
        //     },
        //     null,
        //     this._disposables
        // );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case "information":
                        vscode.window.showInformationMessage(message.text, { modal: message.modal });
                        return;
                    case "warning":
                        vscode.window.showWarningMessage(message.text, { modal: message.modal });
                        return;
                    case 'alert':
                        vscode.window.showErrorMessage(message.text, { modal: message.modal });
                        return;
                    case "snapshot":
                        console.log(message);
                        frameCount = (message.frameCount === undefined ? 0 : message.frameCount);
                        save_frame_flag = (message.save_frame_flag === undefined ? true : message.save_frame_flag);
                        environment = (message.environment === undefined ? undefined : message.environment);
                        frames = (message.frames === undefined ? [] : message.frames);
                        counter.snapshot += 1;
                        return;
                    case "eventmacro":
                        console.log(message);
                        counter.eventmacro += 1;
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public sendMessage(type: string) {
        // Send a message type to the webview
        // You can send any JSON serializable data
        this._panel.webview.postMessage({ command: `${type}` });
    }

    public sendHTML(html: string) {
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, html);
        setTimeout(() => {
            this._panel.webview.postMessage({
                command: 'snapshot',
                frameCount: frameCount,
                save_frame_flag: save_frame_flag,
                environment: environment,
                frames: frames,
            });
        }, 1000);
    }

    public dispose() {
        ExecutionPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        // this._panel.title = `p5 preview`;
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview, p5Script: string = '') {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        const p5PathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'p5.min.js');

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        const p5scriptUri = webview.asWebviewUri(p5PathOnDisk);

        // Local path to css styles
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');

        // Uri to load styles into webview
        const styleUri = webview.asWebviewUri(stylePathOnDisk);

        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->

            <meta http-equiv="Content-Security-Policy" content="img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <!-- <meta http-equiv="Permissions-Policy" content="accelerometer=*"> -->

            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <link href="${styleUri}" rel="stylesheet">
            
            <title>p5.js preview</title>

            <script nonce="${nonce}" src="${p5scriptUri}"></script>
            <!--<script nonce="${nonce}" src="http://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>-->
            <!-- <script src="../addons/p5.sound.js"></script> -->
        </head>
        <body>
            <main>
            </main>
            <div id="app"></div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
            <script nonce="${nonce}">${p5Script}</script><!-- for vscode live coding -->
        </body>
        </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

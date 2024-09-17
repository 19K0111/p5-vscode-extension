// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { io, Socket } from "socket.io-client";

let socket: Socket
let intervalID: number = -1

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');
	socket = io("http://localhost:3000")
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from helloworld!');
	});
	let activeEditor = vscode.window.activeTextEditor;
	let emitCode = vscode.workspace.onDidChangeTextDocument(_editor => {
		if (!activeEditor) return;
		const text = activeEditor.document.getText();
		console.log("onDidChangeTextDocument");
		if (intervalID != -1) clearInterval(intervalID);
		intervalID = Number(setTimeout(() => {
			vscode.window.showInformationMessage("hello world from onDidChange");
			socket.emit('editor_to_server', text);
		}, 500));
	}, null, context.subscriptions)

	context.subscriptions.push(disposable);
}



// This method is called when your extension is deactivated
export function deactivate() {
	//	if (!socket) {
	//		return undefined;
	//	}
	if (socket.connected) {
		socket.disconnect();
	}
}

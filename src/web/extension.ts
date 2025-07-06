// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseLef } from '../parser/lefParser'; // Adjust the import path as necessary
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lef-viz" is now active in the web extension host!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('lef-viz.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from lef-viz in a web extension host!');
	});

	context.subscriptions.push(disposable);
  	const previewDisposable =     vscode.commands.registerCommand('lef-viz.showPreview', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No LEF file open');
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'lefPreview',
        'LEF Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'react-dist')],
        }
      );

      // Convert React build assets to webview URIs
      const jsUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'react-dist', 'assets', 'index-CKnCRv9t.js')
      );
      const cssUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'react-dist', 'assets', 'index-B2X0Co8W.css')
      );
      const viteSvgUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'react-dist', 'vite.svg')
      );

		// Convert index.html to webview URI
		const indexUri = vscode.Uri.joinPath(context.extensionUri, 'react-dist', 'index.html');
		const response = await fetch(indexUri.toString());
		let html = await response.text();

		// Inject webview-safe URIs for React build assets
		html = html.replace('/assets/index-CKnCRv9t.js', jsUri.toString());
		html = html.replace('/assets/index-B2X0Co8W.css', cssUri.toString());
		html = html.replace('/vite.svg', viteSvgUri.toString());
		panel.webview.html = html;

    const sampleData = [
      {
          name: "M2_M1",
          layers: [
              {
                  layer: "Metal1",
                  rects: [[-5.2, -0.4, 0.4, 0.4], [-0.4, -0.8, 0.4, 0.8]],
              },
              {
                  layer: "Via1",
                  rects: [[-0.4, -0.4, 0.4, 0.4]],
              },
              {
                  layer: "Metal2",
                  rects: [[-0.8, -0.8, 0.8, 0.2]],
              },
          ],
      },
      {
          name: "M3_M2",
          layers: [
              {
                  layer: "Metal2",
                  rects: [[-0.2, -0.2, 0.2, 0.2]],
              },
              {
                  layer: "Via2",
                  rects: [[-0.1, -0.1, 0.1, 0.1]],
              },
              {
                  layer: "Metal3",
                  rects: [[-0.2, -0.2, 0.2, 0.2]],
              },
          ],
      },
      {
          name: "Via23_stack_kalyan",
          layers: [
              {
                  layer: "Metal2",
                  rects: [[-0.2, -0.2, 0.2, 0.3]],
              },
              {
                  layer: "Via2",
                  rects: [[-0.1, -0.1, 0.1, 0.1]],
              },
              {
                  layer: "Metal3",
                  rects: [[-0.2, -0.2, 0.2, 0.2]],
              },
          ],
      }
  ];

      // Flag to track if webview is ready
      let webviewReady = false;

      // Handle messages from webview
      panel.webview.onDidReceiveMessage(
        message => {
          console.log('Received message from webview:', message);
          switch (message.command) {
            case 'webview-ready':
              console.log('Webview is ready, sending initial data');
              webviewReady = true;
              sendLefToWebview();
              break;
            case 'log':
              console.log('Webview log:', message.text);
              break;
            default:
              console.log('Unknown message from webview:', message);
              break;
          }
        },
        undefined,
        context.subscriptions
      );

      const sendLefToWebview = () => {
        if (!webviewReady) {
          console.log('Webview not ready yet, skipping data send');
          return;
        }
        
        const lefText = editor.document.getText();
        const parsed = parseLef(lefText);
        
        // Send both parsed data and sample data for testing
        const message = { 
          type: 'lef-data', 
          data: parsed.vias,
          parsedData: parsed.vias 
        };
        
        panel.webview.postMessage(message);
        console.log('Sent LEF data to webview:', message);
      };

      // Set up change listener for editor
      const changeListener = vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document === editor.document) {
          console.log('Editor content changed, updating webview');
          sendLefToWebview();
        }
      });

      // Clean up when panel is disposed
      panel.onDidDispose(() => {
        changeListener.dispose();
      }, null, context.subscriptions);

      // Send initial data after a short delay to ensure webview is loaded
      setTimeout(() => {
        if (!webviewReady) {
          console.log('Webview not ready after timeout, sending data anyway');
          webviewReady = true; // Force ready state
          sendLefToWebview();
        }
      }, 1000);

      // Also send data immediately in case webview is already ready
      setTimeout(() => {
        sendLefToWebview();
      }, 500);
    });
	context.subscriptions.push(previewDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

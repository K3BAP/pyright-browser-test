import workerScript from '@typefox/pyright-browser/dist/pyright.worker';
import { createMessageConnection } from 'vscode-jsonrpc';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
  } from "vscode-jsonrpc/browser";

import {
    InitializeRequest,
    LogMessageNotification,
    PublishDiagnosticsNotification,
    InitializeParams,
    DidOpenTextDocumentNotification,
    DidOpenTextDocumentParams,
    InitializedNotification
} from 'vscode-languageserver-protocol'
import { files } from './pyright-browser.files';



async function initialize() {
    // Initialize the worker with the JavaScript file
    const worker = new Worker(workerScript);
    // Send the `boot` request to the language server
    // This starts the language server and a nested worker that performs the language analysis.
    worker.postMessage({
        type: 'browser/boot',
        mode: 'foreground'
    });

    const connection = createMessageConnection(
        new BrowserMessageReader(worker),
        new BrowserMessageWriter(worker)
    );

    connection.onNotification(LogMessageNotification.type, (params) =>
        console.log("[LS]", params.message)
    );

    connection.onNotification(
    PublishDiagnosticsNotification.type,
    (params) => {
        const diagString = JSON.stringify(params, null, 2);
        consoleTextArea.value = diagString;
        console.log(`new diagnostics! \n${diagString}`)
        }
    );

    /** @type {InitializeParams} */
    const initializeParams = {
      rootUri: null,
      capabilities: {
        textDocument: {
          publishDiagnostics: {

          }
        }
      },
      initializationOptions: {
        files: files.files
      },
      trace: "off",
      locale: undefined,
    };

    connection.listen();
    const initializeResponse = await connection.sendRequest(InitializeRequest.type, initializeParams);

    console.log(`Server initialized.\n${JSON.stringify(initializeResponse, null, 2)}`)

    connection.sendNotification(InitializedNotification.type, {});

    /** @type {DidOpenTextDocumentParams} */
    const didOpenTextDocumentParams = {
      textDocument: {
        languageId: "python",
        uri: "/src/unnamed.py",
        version: 1,
        text: "print(hallo)"
      }
    };

    await connection.sendNotification(DidOpenTextDocumentNotification.type, didOpenTextDocumentParams);

}

window.addEventListener('load', async () => {
    initialize();
    //checkButton.onclick = onButtonClick;
  });


  /** @type {HTMLTextAreaElement | null} */
const inputTextArea = document.querySelector('.code-input');

/** @type {HTMLTextAreaElement | null} */
const consoleTextArea = document.querySelector('.console');

/** @type {HTMLButtonElement | null} */
const checkButton = document.querySelector('.button');
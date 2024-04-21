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
    RegistrationRequest,
    InitializeParams
} from 'vscode-languageserver-protocol'



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
          diagnostic: {
            dynamicRegistration: false,
            relatedDocumentSupport: false
          }
        }
      },
      trace: "off",
      locale: undefined,
    };

    connection.listen();
    const initializeResponse = await connection.sendRequest(InitializeRequest.type, initializeParams);

    console.log(`Server initialized.\n${JSON.stringify(initializeResponse, null, 2)}`)
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
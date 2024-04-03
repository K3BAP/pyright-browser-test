import workerScript from '@typefox/pyright-browser/dist/pyright.worker';
import { createMessageConnection } from 'vscode-jsonrpc';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
  } from "vscode-jsonrpc/browser";

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
import workerScript from '@typefox/pyright-browser/dist/pyright.worker';

// Initialize the worker with the JavaScript file
const worker = new Worker(workerScript);
// Send the `boot` request to the language server
// This starts the language server and a nested worker that performs the language analysis.
worker.postMessage({
    type: 'browser/boot',
    mode: 'foreground'
});
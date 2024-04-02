import { WebContainer } from '@webcontainer/api';
import pyrightSnapshot from './pyright-dist.bin';

const internalFileName = './unnamed.py';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

async function bootContainer() {
    webcontainerInstance = await WebContainer.boot();

    const snapshotResponse = await fetch(pyrightSnapshot);
    const snapshot = await snapshotResponse.arrayBuffer();
    await webcontainerInstance.mount(snapshot);

    webcontainerInstance.fs.writeFile(internalFileName, '');

    const serverProcess = await webcontainerInstance.spawn('node', ['index.js', '-w', '--outputjson', internalFileName])
    serverProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
          const responseObject = JSON.parse(data);
          consoleTextArea.value = JSON.stringify(responseObject.generalDiagnostics, null, 2);
        }
      }));
}

function onButtonClick() {
  const text = inputTextArea.value;
  webcontainerInstance.fs.writeFile(internalFileName, text);
}

window.addEventListener('load', async () => {
    bootContainer();
    checkButton.onclick = onButtonClick;
  });

/** @type {HTMLTextAreaElement | null} */
const inputTextArea = document.querySelector('.code-input');

/** @type {HTMLTextAreaElement | null} */
const consoleTextArea = document.querySelector('.console');

/** @type {HTMLButtonElement | null} */
const checkButton = document.querySelector('.button');
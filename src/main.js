const { invoke, convertFileSrc } = window.__TAURI__.tauri;

const parameters = {
  prompt: '',
  negativePrompt: '',
  steps: '',
  sampler: '',
  cfgScale: '',
  seed: '',
  size: '',
  modelHash: '',
  model: '',
  vaeHash: '',
  vae: '',
  tiHashes: '',
  version: ''
}

/// 拡張子がPNGかどうかを判定。
/// filename:string
/// return boolean
function isPNGExtension(filename) {
  let reg = new RegExp('([^\s]+(\\.png)$)', 'i');
  return reg.test(filename);
}

/// メタデータを情報ごとに分割。
/// metadata:string
/// return Object | null
function analysisMetadata(metadata) {
  const spliter = splitText => new RegExp(`(${splitText})(?!.*(${splitText}))`,'g');
  const makeReg = term => new RegExp(`${term}\\s(.+)`, 'g');
  // 結果がnullであっても添字で参照したときにエラーを発生させたくないので[null, null]が返るようにしている。
  const getData = (term, target) => makeReg(term).exec(target) ?? [null, null];
  const splitedData = metadata.split('\n');
  const retData = Object.create(parameters);
  const ok = getData('parameters', splitedData[0]);
  if (ok[0] == null) {
    // 'parameters'が含まれていなければreturn
    return null;
  }
  const values = splitedData[2].split(', ');
  retData.prompt = ok[1];
  retData.negativePrompt = getData('Negative prompt:', splitedData[1])[1];
  retData.steps = getData('Steps:', values[0])[1];
  retData.sampler = getData('Sampler:', values[1])[1];
  retData.cfgScale = getData('CFG scale:', values[2])[1];
  retData.seed = getData('Seed:', values[3])[1];
  retData.size = getData('Size:', values[4])[1];
  retData.modelHash = getData('Model hash:', values[5])[1];
  retData.model = getData('Model:', values[6])[1];
  retData.vaeHash = getData('VAE hash:', values[7])[1];
  retData.vae = getData('VAE:', values[8])[1];
  retData.tiHashes = getData('TI hashes:', values[9])[1];
  retData.version = getData('Version:', values[10])[1];
  return retData;
}

async function read_png(path){
  const filename = path.split('\\').pop();
  if (isPNGExtension(filename)) {
    const metadata = await invoke("read_png", { path: path });
    const obj = analysisMetadata(metadata);
    document.querySelector("#path").textContent = path;
    if (obj == null) {
      document.querySelector("#data").textContent = "パラメータを発見できませんでした";
    } else {
      document.querySelector("#data").innerHTML = `
      <ul>
        <li>Prompt: <span id="js-prompt">${obj.prompt}</span><button type="button" class="copy-button" id="js-prompt-button" onclick="copyText('#js-prompt')">copy</button></li>
        <li>Negative prompt: <span id="js-nprompt">${obj.negativePrompt}</span><button type="button" class="copy-button" id="js-nprompt-button" onclick="copyText('#js-nprompt')">copy</button></li>
        <li>Steps: ${obj.steps}</li>
        <li>Sampler: ${obj.sampler}</li>
        <li>CFG Scale: ${obj.cfgScale}</li>
        <li>Seed: ${obj.seed}</li>
        <li>Size: ${obj.size}</li>
        <li>Model: ${obj.model}</li>
        <li>Model Hash: ${obj.modelHash}</li>
        <li>VAE: ${obj.vae}</li>
        <li>VAE Hash: ${obj.vaeHash}</li>
        <li>TI Hashes: ${obj.tiHashes}</li>
        <li>Version: ${obj.version}</li>
      </ul>
      `;
    }
    let pic = document.querySelector("#input-picture");
    pic.setAttribute("alt", filename);
    pic.setAttribute("src", convertFileSrc(path));
    const promptCopyButton = document.querySelector("#js-prompt-button");
    const negativePromptCopyButton = document.querySelector("#js-nprompt-button");
  } else {
    alert("PNGファイルではありません");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  /*
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
  */
});

// dnd時の動作設定
window.__TAURI__.event.listen("tauri://file-drop", (e) => {
  const paths = e.payload;
  read_png(paths[0]);
  document.querySelector("#drop-here").style.display="none";
});


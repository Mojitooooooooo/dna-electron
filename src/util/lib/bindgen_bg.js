import * as bindgen from './bindgen'

export let compile = async () => {
  const fetchPromise =await fetch('/static/bindgen_bg.wasm');
  const buffer = await fetchPromise.arrayBuffer();
  const module = await WebAssembly.compile(buffer);
  let imports = {};
  imports['./bindgen'] = bindgen;
  const instance = await WebAssembly.instantiate(module, imports);
  // console.log(instance.exports)
  return instance.exports;
};

import  md5 from 'md5'
// 这个函数的目的是将buffer数据按size分割成二维数组
export let read_file = (file_in, chunk_size, name) => {
  let original_size = file_in.length;
  window.infos.push({name: name, information: `Input file has ${original_size} bytes`})
  let pad = chunk_size - original_size % chunk_size;

  let size = original_size + pad;
  window.infos.push({name: name, information: `File MD5 is ${md5(file_in)}`})
  let tmp = Buffer.alloc(pad)

  // 补全后的数据
  let data = Buffer.concat([file_in, tmp], size)
  window.infos.push({name: name, information: `There are ${size / chunk_size} input segments`})
  let f_in = []

  for (let i = 0; i < size / chunk_size; i++) {
    let temp = data.slice(i * chunk_size, (i + 1) * chunk_size);
    f_in.push(temp);
  }

  return { f_in, file_size: data.length }
}
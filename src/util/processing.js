// 这个函数的目的是将buffer数据按size分割成二维数组
export let read_file = (file_in, chunk_size) => {
  let original_size = file_in.length;
  let pad = chunk_size - original_size % chunk_size;

  let size = original_size + pad;
  let tmp = Buffer.alloc(pad)

  // 补全后的数据
  let data = Buffer.concat([file_in, tmp], size)
  let f_in = []

  for (let i = 0; i < size / chunk_size; i++) {
    let temp = data.slice(i * chunk_size, (i + 1) * chunk_size);
    f_in.push(temp);
  }

  return { f_in, file_size: data.length }
}
// js都是有符号整数，最大32位，需要使用大数
export let lfsr = function* (state, mask) {
  let result = BigInt(parseInt(state, 2))
  let nbits = BigInt(mask.length - 1)
  mask = BigInt(parseInt(mask, 2))
  while(true) {
    result = (result << BigInt(1))
    let xor = result >> nbits
    if(xor != BigInt(0)){
      result ^= mask
    }
    yield result
  }
}

export let lfsr32p = () => {
    return '100000000000000000000000011000101'
}

export let lfsr32s = () => {
    return '001010101'
}

let test = () => {
  for (pattern of lfsr('001', '100000000000000000000000011000101'))
    console.log(pattern)
}

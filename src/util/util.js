let trantab = {
  '0': 'A',
  '1': 'C',
  '2': 'G',
  '3': 'T'
}

let revtab = {
  'A': '0',
  'C': '1',
  'G': '2',
  'T': '3'
}

export let screen_repeat = (drop, max_repeat, gc_dev) => {
  let dna = drop.toDNA()
  return screen_repeat_dna(dna, max_repeat, gc_dev)
}

let screen_repeat_dna = (dna, max_repeat, gc_dev) => {
  let { As, Gs, Cs, Ts } = window || global
  if (dna.includes(As) || dna.includes(Cs) || dna.includes(Ts) || dna.includes(Gs))
    return false
  let gc = count(dna, '1') + count(dna, '2')
  gc = gc / dna.length
  if (gc < 0.5 - gc_dev || gc > 0.5 + gc_dev)
    return false
  return true
}

let count = (data, str) => {
  let ct = 0
  data.split('').forEach(i => {
    if (str == i)
      ct += 1
  }
  )
  return ct
}

export let int_to_four = (data) => {
  let bin_data = []
  for (let i = 0; i < data.length; i++) {
    let binary_num = data[i].toString(2)
    let help = '00000000'
    binary_num = help.slice(0, 8 - binary_num.length) + binary_num
    bin_data.push(binary_num)
  }
  let temp = bin_data.join('')
  let result = ''
  for (let i = 0; i < temp.length; i += 2) {
    result += parseInt(temp.slice(i, i + 2), 2)
  }
  return result
}

export let four_to_dna = (s) => {
  return translate(s, trantab)
}

let translate = (str, tran) => {
  return str.split('').map(i => tran[i]).join('')
}

export let prepare = (max_repeat) => {
  let gl = window || global
  gl.As = '0'.repeat(max_repeat + 1)
  gl.Cs = '1'.repeat(max_repeat + 1)
  gl.Gs = '2'.repeat(max_repeat + 1)
  gl.Ts = '3'.repeat(max_repeat + 1)
}

export let dna_to_int_array = (dna_str) => {
  let num = translate(dna_str, revtab)
  let s = ''
  for (let i = 0; i < num.length; i++) {
    let temp = parseInt(num[i]).toString(2)
    s = s + '0'.repeat(2 - temp.length) + temp
  }

  let data = []
  for (let i = 0; i < s.length; i += 8) {
    data.push(parseInt(s.slice(i, i + 8), 2))
  }

  return data
}

export let XOR = (data, chunk) => {
  return data.map((index, el) => {
    return el ^ chunk[index]
  })
}
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

let file_type_map = {
  "ffd8ffe000104a464946": "jpg",
  "89504e470d0a1a0a0000": "png",
  "47494638396126026f01": "gif",
  "49492a00227105008037": "tif",
  "424d228c010000000000": "bmp",
  "424d8240090000000000": "bmp",
  "424d8e1b030000000000": "bmp",
  "41433130313500000000": "dwg",
  "3c21444f435459504520": "html",
  "3c21646f637479706520": "htm",
  "48544d4c207b0d0a0942": "css",
  "696b2e71623d696b2e71": "js",
  "7b5c727466315c616e73": "rtf",
  "38425053000100000000": "psd",
  "46726f6d3a203d3f6762": "eml",
  "d0cf11e0a1b11ae10000": "wps",
  "5374616E64617264204A": "mdb",
  "252150532D41646F6265": "ps",
  "255044462d312e360d25": "pdf",
  "2e524d46000000120001": "rmvb",
  "464c5601050000000900": "flv",
  "00000020667479706973": "mp4",
  "49443303000000000f76": "mp3",
  "000001ba210001000180": "mpg",
  "3026b2758e66cf11a6d9": "wmv",
  "524946464694c9015741": "wav",
  "52494646d07d60074156": "avi",
  "4d546864000000060001": "mid",
  "504b0304140000000800": "zip",
  "526172211a0700cf9073": "rar",
  "235468697320636f6e66": "ini",
  "504b03040a0000000000": "jar",
  "4d5a9000030000000400": "exe",
  "3c25402070616765206c": "jsp",
  "4d616e69666573742d56": "mf",
  "3c3f786d6c2076657273": "xml",
  "efbbbf2f2a0d0a53514c": "sql",
  "7061636b616765207765": "java",
  "406563686f206f66660d": "bat",
  "1f8b0800000000000000": "gz",
  "6c6f67346a2e726f6f74": "properties",
  "cafebabe0000002e0041": "class",
  "49545346030000006000": "chm",
  "04000000010000001300": "mxp",
  "504b0304140006000800": "docx",
  "6431303a637265617465": "torrent",
  "494d4b48010100000200": "264",
  "6D6F6F76": "mov",
  "FF575043": "wpd",
  "CFAD12FEC5FD746F": "dbx",
  "2142444E": "pst",
  "AC9EBD8F": "qdf",
  "E3828596": "pwl",
  "2E7261FD": "ram"
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
  return data.map((el, index) => {
    return el ^ chunk[index]
  })
}

export let getAllFileType = (key) => {
  let fileType = Object.keys(file_type_map).filter(i => i.indexOf(key) == 0)
  return file_type_map[fileType[0]] || ''
}
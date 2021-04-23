import { PRNG } from './robust_solition'
import { Encoder, Decoder } from './lib/index'
import { Droplet } from './Droplet'
import { XOR, dna_to_int_array } from './util'


export class Glass {
  constructor(num_chunks, header_size, rs = 0, c_dist = 0.1, delta = 0.05, flag_correct = true, gc = 0.2, max_homopolymer = 4, max_hamming = 100, decode = true, chunk_size = 32, exDNA = false) {
    this.entries = []
    this.droplets = []
    this.num_chunks = num_chunks
    this.chunks = new Array(num_chunks).fill(null)
    this.header_size = header_size
    this.decode = decode
    this.chunk_size = chunk_size
    this.exDNA = exDNA
    this.chunk_to_droplets = new Proxy({}, {
      get: (target, name) => name in target ? target[name] : [],
      set: (target, key, {value, ope}) => {
        if(ope == 'add') {
          key in target ? target[key].push(value) : target[key] = [value]
        }else {
          target[key].splice(target[key].indexOf(value), 1)
        }
        return true
      }
    })
    this.done_segments = []
    this.truth = this.truth

    this.PRNG = new PRNG(this.num_chunks, delta, c_dist)

    this.max_homopolymer = max_homopolymer
    this.gc = gc

    this.max_hamming = max_hamming

    this.rs = rs
    this.correct = flag_correct
    this.seen_seeds = []

    if(this.rs > 0) {
      this.RSCodec = new Decoder(rs)
    }
  }

  add_dna(dna_string) {
    let data = dna_to_int_array(dna_string)

    let data_corrected = this.RSCodec.correct(Buffer.from(data))
    data_corrected = data_corrected.slice(0, data_corrected.length - this.rs)

    let seed_array = data_corrected.slice(0, this.header_size)
    let seed = seed_array.readUInt32BE()

    let payload = data_corrected.slice(this.header_size)

    if(this.seen_seeds.includes(seed)) {
      return { seed: -1, data: null }
    }

    this.add_seed(seed)

    if(this.decode) {
      this.PRNG.set_seed(seed)
      let { blockseed, d, nums } = this.PRNG.get_src_blocks()

      d = new Droplet(payload, seed, 0, nums)

      this.addDroplet(d)
    }

    return {seed, data}
  }

  add_seed(seed) {
    this.seen_seeds.push(seed)
  } 

  addDroplet(droplet) {
    this.droplets.push(droplet)
    for(let chunk_num of droplet.num_chunks) {
      this.chunk_to_droplets[chunk_num] = {value: droplet, ope: 'add'}
    }

    this.updateEntry(droplet)
  }

  updateEntry(droplet) {
    let Intersection = droplet.num_chunks.filter(item => this.done_segments.includes(item))
    Intersection.forEach(chunk_num => {
      droplet.data = XOR(droplet.data, this.chunks[chunk_num])
      droplet.num_chunks.splice(droplet.num_chunks.indexOf(chunk_num), 1)
      // 通过proxy删除
      this.chunk_to_droplets[chunk_num] = {value: droplet, ope:'delete'}
    })

    if(droplet.num_chunks.length == 1) {
      let lone_chunk = droplet.num_chunks.pop()

      this.chunks[lone_chunk] = droplet.data
      this.done_segments.push(lone_chunk)

      this.droplets.splice(this.droplets.indexOf(droplet), 1)
      this.chunk_to_droplets[lone_chunk] = {value: droplet, ope:'delete'}

      let temp = [...this.chunk_to_droplets[lone_chunk]]
      temp.forEach(other_droplet => {
        this.updateEntry(other_droplet)
      });
    }
  }

  isDone() {
    if(this.num_chunks - this.done_segments.length > 0) {
      return false
    }
    return true
  }

  getString() {
    let totalLength = this.chunks.length * this.chunks[0].length
    return Buffer.concat(this.chunks, totalLength)
  }
}
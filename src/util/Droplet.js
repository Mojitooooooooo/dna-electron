import { Encoder, Decoder } from './lib/index'
import { int_to_four, four_to_dna } from './util'

export class Droplet {
  constructor(data, seed, rs = 0, num_chunks = null, degree = null) {
    this.data = data
    this.seed = seed
    this.rs = rs
    this.num_chunks = num_chunks
    this.degree = degree

    this.DNA = null
  }

  chunkNums() {
    return this.num_chunks
  }

  toDNA(flag = null) {
    if(this.DNA) {
      return this.DNA
    }

    this.DNA = int_to_four(this._package())
    return this.DNA
  }

  to_human_readable_DNA() {
    return four_to_dna(this.toDNA())
  }

  _package() {
    let buf = Buffer.alloc(4)
    buf.writeUInt32BE(this.seed)
    
    let message = Buffer.concat([buf, this.data], this.data.length + 4)
    let result

    if(this.rs > 0)
      result = new Encoder(this.rs).encode(message)
    
    return result
  }
}
import { lfsr, lfsr32s, lfsr32p } from './lfsr'
import { PRNG } from './robust_solition'

export class DNAFountain {
  constructor(
    file_in,
    file_size,
    chunk_size,
    rs = 0,
    max_ho = 3,
    gc = 0.05,
    delta = 0.5,
    c_dist = 0.1,
    alpha,
    stop = null,
  ) {
    // data相关数据
    this.file_in = file_in
    this.chunk_size = chunk_size
    this.num_chunks = file_size / chunk_size
    this.file_size = file_size
    this.alpha = alpha
    this.stop = stop
    this.final = this.calc_stop()

    // 随机数生成器部分
    this.lfsr = lfsr(lfsr32s(), lfsr32p())
    this.lfsr_l = lfsr32p().length - 1
    this.seed = this.lfsr.next().value

    this.PRNG = new PRNG(this.num_chunks, delta, c_dist)
    this.PRNG.set_seed(this.seed)

    console.log(this.PRNG)

    // rs纠错码部分
    this.rs = rs
    // this.rs_obj =
    
  }

  calc_stop() {
    if(this.stop) 
      return this.stop
    stop = Math.floor(this.num_chunks * (1 + this.alpha)) + 1
    return stop
  }
}
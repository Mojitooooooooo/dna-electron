import { lfsr, lfsr32s, lfsr32p } from './lfsr'
import { PRNG } from './robust_solition'
import { screen_repeat, XOR } from './util'
import { Droplet } from './Droplet'

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
    this.seed = Number(this.lfsr.next().value)

    this.PRNG = new PRNG(this.num_chunks, delta, c_dist)
    this.PRNG.set_seed(this.seed)

    console.log(this.PRNG)

    // rs纠错码部分
    this.rs = rs
    
    // 生物筛选部分
    this.gc = gc
    this.max_ho = max_ho
    this.tries = 0
    this.good = 0
    this.oligo_l = this.calc_oligo_length()
  }

  calc_stop() {
    if(this.stop) 
      return this.stop
    stop = Math.floor(this.num_chunks * (1 + this.alpha)) + 1
    return stop
  }

  calc_oligo_length() {
    return (this.chunk_size * 8 + this.lfsr_l + this.rs * 8) / 4
  }

  droplet() {
    let data = null
    let {d, nums} = this.rand_chunk_nums()
    
    for(let key in nums) {
      if(!data)
        data = this.chunk(nums[key])
      else
        data = XOR(data, this.chunk(nums[key]))
    }

    this.tries += 1
    return new Droplet(data, this.seed, this.rs,  nums, d)
  }

  rand_chunk_nums() {
    this.updateSeed()
    let { d, nums }  = this.PRNG.get_src_blocks()
    return {d, nums}
  }

  updateSeed() {
    this.seed = Number(this.lfsr.next().value)
    this.PRNG.set_seed(this.seed)
  }

  chunk(num) {
    return this.file_in[num]
  }

  screen(droplet) {
    if(screen_repeat(droplet, this.max_ho, this.gc)) {
      this.good += 1
      return true
    }
    return false
  }
}
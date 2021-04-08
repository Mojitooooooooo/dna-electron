const seedrandom = require('seedrandom')

let gen_tau = (S, K, delta) => {
  let pivot = Math.floor(K / S)
  let val1 = []
  for(let i = 1; i < pivot; i++) {
    val1.push(S / K / i)
  }
  let val2 = [S / K * Math.log(S / delta)]

  let val3 = []
  for(let i = pivot; i < K; i++) {
    val3.push(0)
  }
  return [...val1, ...val2, ...val3]
}

let gen_rho = (K) => {
  let temp = []
  for(let i = 2; i < K + 1; i++) {
    temp.push(1 / (i * (i - 1)))
  }
  return [1 / K, ...temp]
}

let gen_mu = (K, S, delta) => {
  let tau = gen_tau(S, K, delta)
  let rho = gen_rho(K)

  let Z = sum(tau) + sum(rho)
  let mu = []
  for(let i = 0; i < K; i++) {
    mu.push((rho[i] + tau[i]) / Z)
  }

  return {mu, Z}
}

let gen_rsd_cdf = (K, S, delta) => {
  let { mu, Z} = gen_mu(K, S, delta)
  let total = 0
  let cdf = mu.map(item => {
    total += item
    return total
  })
  return {cdf, Z}  
}

let sum = (arr) => {
  return arr.reduce((total, cur) => {
    return total + cur
  }, 0)
}

export class PRNG {
  constructor(K, delta, c_dist) {
    this.K = K
    this.K_int = K
    this.delta = delta
    this.c = c_dist

    let S = this.calc_S()
    let { cdf, Z } = gen_rsd_cdf(K, S, delta)
    this.cdf = cdf
    this.Z = Z

    // 这里np可以不要

    this.state = 1
  }

  calc_S() {
    // A helper function to calculate S, the expected number of degree=1 nodes
    let S = this.c * Math.log(this.K / this.delta) * Math.sqrt(this.K)
    this.S = S
    return S
  }

  get_S() {
    return this.S
  }

  set_seed(seed){
    this.state = seed
  }

  get_state() {
    return this.state
  } 

  get_src_blocks(seed) {
    if(seed)
      this.state = seed

    let blockseed = this.state
    let rng = seedrandom(this.state)
    let p = rng()

    
  }
}
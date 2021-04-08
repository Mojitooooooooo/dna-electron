import random

def get_src_blocks(seed, K_int, cdf):

  blockseed = seed
  random.seed(seed)
  
  d = _sample_d(cdf)

  nums = random.sample(range(K_int), d)
  return blockseed, d, nums

def _sample_d(cdf):
  p = random.random()

  for ix, v in enumerate(cdf):
    if v > p:
      return ix + 1
  return ix + 1

cdf = [0.08606697685024386, 0.40765569722721884, 0.5214587881625885, 0.581663759035129, 0.6197687968015668, 0.6464935254744676, 0.6665264532136412, 0.6822590258904905, 0.695046042206627, 0.7057161119801837, 0.7148065427481688, 0.7226822131219311, 0.7296003515462575]
get_src_blocks(170, 13, cdf)
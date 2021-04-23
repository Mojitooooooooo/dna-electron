import { Encoderr, Decoderr } from './bindgen'

export class Encoder {
  constructor (ecc_len) {
    if (typeof ecc_len !== 'number') {
      throw new Error('ecc_len must be a number')
    }
    this._raw = new Encoderr(ecc_len)
  }

  encode (data) {
    if (!(data instanceof Buffer)) {
      throw new Error('data must be a Buffer')
    }
    return Buffer.from(this._raw.encode(data))
  }
}

export class Decoder {
  constructor (ecc_len) {
    if (typeof ecc_len !== 'number') {
      throw new Error('ecc_len must be a number')
    }
    this._raw = new Decoderr(ecc_len)
  }

  correct (data) {
    if (!(data instanceof Buffer)) {
      throw new Error('data must be a Buffer')
    }
    return Buffer.from(this._raw.correct(data))
  }

  is_corrupted (data) {
    if (!(data instanceof Buffer)) {
      throw new Error('data must be a Buffer')
    }
    return this._raw.is_corrupted(data)
  }
}
import * as crypto from 'crypto'

function getHash() {
  // Generate new SHA-256 hash
  const hash = crypto.createHash('sha256')
  const bytes = crypto
    .randomBytes(Math.ceil(50 / 2))
    .toString('hex')
    .slice(0, 50)

  hash.update(bytes)
  return hash.digest('hex')
}

function getMultiplier(hash: string) {
  const e = Math.pow(2, 52)
  const h = parseInt(hash.slice(0, 13), 16)
  if (h % 33 === 0) return { multiplier: 1.0, hash }

  const multiplier = parseFloat(((100 * e - h) / (e - h) / 100.0).toFixed(2))
  return { multiplier, hash }
}
export { getHash, getMultiplier }
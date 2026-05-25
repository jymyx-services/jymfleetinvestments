import { test } from 'node:test'
import assert   from 'node:assert'
import { generateInviteCode, hashCode } from '../src/lib/crypto.js'

test('two generated codes are never identical', () => {
  const codes = new Set()
  for (let i = 0; i < 1000; i++) {
    codes.add(generateInviteCode())
  }
  assert.strictEqual(codes.size, 1000)
})

test('raw code and hash are never equal', () => {
  const raw  = generateInviteCode()
  const hash = hashCode(raw)
  assert.notStrictEqual(raw, hash)
})

test('hash length is always 64', () => {
  for (let i = 0; i < 100; i++) {
    const hash = hashCode(generateInviteCode())
    assert.strictEqual(hash.length, 64)
  }
})
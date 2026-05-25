import { test } from 'node:test'
import assert   from 'node:assert'
import { hashCode, generateInviteCode } from '../src/lib/crypto.js'

test('generateInviteCode produces correct format', () => {
  const code = generateInviteCode()
  assert.match(code, /^JYX-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
})

test('hashCode is deterministic', () => {
  const raw  = 'JYX-K9M2-XP44-NR73'
  const h1   = hashCode(raw)
  const h2   = hashCode(raw)
  assert.strictEqual(h1, h2)
})

test('hashCode strips formatting before hashing', () => {
  const withDashes    = hashCode('JYX-K9M2-XP44-NR73')
  const withoutDashes = hashCode('JYXK9M2XP44NR73')
  assert.strictEqual(withDashes, withoutDashes)
})

test('hashCode is 64 hex characters', () => {
  const hash = hashCode('JYX-K9M2-XP44-NR73')
  assert.strictEqual(hash.length, 64)
  assert.match(hash, /^[a-f0-9]+$/)
})
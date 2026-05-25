import { test } from 'node:test'
import assert   from 'node:assert'

// Pure math tests — no DB required
function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function calcDistribution(grossAmount, companyCutPercent, investors) {
  const companyCut    = round(grossAmount * (companyCutPercent / 100))
  const distributable = round(grossAmount - companyCut)
  const totalUnits    = investors.reduce((s, i) => s + i.units, 0)
  const perUnitValue  = round(distributable / totalUnits)

  return investors.map(inv => ({
    ...inv,
    grossCredit:    round(inv.units * perUnitValue),
    referralCredit: inv.hasReferrer ? round(inv.units * perUnitValue * 0.10) : 0
  }))
}

test('company cut is correctly deducted', () => {
  const result = calcDistribution(5_000_000, 20, [
    { id: 1, units: 1, hasReferrer: false }
  ])
  // 20% of 5M = 1M cut, 4M distributable
  assert.strictEqual(result[0].grossCredit, 4_000_000)
})

test('units multiply credit correctly', () => {
  const investors = [
    { id: 1, units: 1, hasReferrer: false },
    { id: 2, units: 4, hasReferrer: false }
  ]
  const result = calcDistribution(5_000_000, 20, investors)
  // 4M distributable / 5 total units = 800k per unit
  assert.strictEqual(result[0].grossCredit, 800_000)
  assert.strictEqual(result[1].grossCredit, 3_200_000)
})

test('referral bonus is 10% of referee credit', () => {
  const result = calcDistribution(5_000_000, 20, [
    { id: 1, units: 1, hasReferrer: true }
  ])
  assert.strictEqual(result[0].referralCredit, 400_000)
})

test('unit sale fee is 3% of gross value', () => {
  const grossValue = 2_000_000
  const feeAmount  = round(grossValue * 0.03)
  const netValue   = round(grossValue - feeAmount)
  assert.strictEqual(feeAmount, 60_000)
  assert.strictEqual(netValue,  1_940_000)
})
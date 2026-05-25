/**
 * Shared type definitions used across server and frontend.
 * In plain JS we use JSDoc — no TypeScript compiler needed.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {'investor'|'admin'|'superadmin'} role
 * @property {'active'|'suspended'|'pending'} status
 * @property {string} investorCode
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Fleet
 * @property {string}  id
 * @property {string}  name
 * @property {string}  equipmentType
 * @property {string}  model
 * @property {number}  minimumDeposit
 * @property {number}  companyCutPercent
 * @property {number}  totalUnits
 * @property {'active'|'idle'|'retired'} status
 * @property {string}  createdAt
 */

/**
 * @typedef {Object} Investment
 * @property {string}  id
 * @property {string}  userId
 * @property {string}  fleetId
 * @property {number}  amount
 * @property {number}  units
 * @property {'active'|'sold'|'pending_sale'} status
 * @property {string}  purchasedAt
 */

/**
 * @typedef {Object} DistributionPreview
 * @property {string}  fleetId
 * @property {string}  fleetName
 * @property {number}  grossAmount
 * @property {number}  companyCutPercent
 * @property {number}  companyCut
 * @property {number}  distributable
 * @property {number}  totalUnits
 * @property {number}  perUnitValue
 * @property {number}  totalInvestors
 * @property {Array}   breakdown
 */

/**
 * @typedef {Object} Notification
 * @property {string}  id
 * @property {string}  userId
 * @property {'fleet_active'|'fleet_idle'|'earnings_credited'|'referral_bonus'|'sale_approved'|'sale_rejected'|'system'} type
 * @property {string}  title
 * @property {string}  body
 * @property {Object}  data
 * @property {boolean} isRead
 * @property {string}  createdAt
 */
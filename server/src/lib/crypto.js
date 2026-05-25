import crypto from 'crypto'

const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'

export function generateInviteCode() {
    const raw = crypto.randomBytes(12)
    let code = ''
    for (let i = 0; i < raw.length; i++) {
        code += ALPHABET[raw[i] % ALPHABET.length]
    }
    return `JYX-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
}

export function hashCode(rawCode) {
    const normalised = rawCode.replace(/-/g, '').toUpperCase().trim()
    return crypto.createHash('sha256').update(normalised).digest('hex')
}

export function generateInvestorCode(sequence) {
    return `JFI-${String(sequence).padStart(5, '0')}`
}
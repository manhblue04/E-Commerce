/**
 * Returns the frontend base URL used for email links.
 * Priority: FRONTEND_URL > first entry in CLIENT_URL > http://localhost
 * Trailing slashes are stripped for safe URL concatenation.
 */
const getClientUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '')

module.exports = getClientUrl

/**
 * Abbreviates a number into a human-readable format (e.g., 1000 -> 1K)
 * @param {number} number - The number to abbreviate
 * @param {number} decPlaces - Number of decimal places
 * @param {object} options - Optional symbols (e.g., for Hz)
 * @returns {string|number}
 */
export function abbreviateNumber(number, decPlaces = 0, options = {}) {
  if (number === null || number === undefined) return ''
  const symbols = options.symbols || ['', 'K', 'M', 'G', 'T', 'P', 'E']
  const absNumber = Math.abs(number)
  const tier = absNumber > 0 ? Math.floor(Math.log10(absNumber) / 3) : 0

  if (tier === 0) return number

  const suffix = symbols[tier] || ''
  const scale = Math.pow(10, tier * 3)
  const scaled = number / scale

  return scaled.toFixed(decPlaces).replace(/\.0$/, '') + suffix
}

/**
 * Converts a flat array to a tree structure based on parent-child relationships.
 * @param {Array} items - The flat array of objects
 * @param {object} config - Configuration for id and parentId fields
 * @returns {Array} - The tree structure
 */
export function arrayToTree(items, { parentId = 'parent', id = 'id' } = {}) {
  const root = []
  const mapping = {}

  items.forEach((item) => {
    mapping[item[id]] = { ...item, children: [] }
  })

  items.forEach((item) => {
    const parent = item[parentId]
    if (parent && mapping[parent]) {
      mapping[parent].children.push(mapping[item[id]])
    } else {
      root.push(mapping[item[id]])
    }
  })

  return root
}

/**
 * Simple pluralization / singularization for Migasfree models.
 * Handles common irregular cases and defaults to standard +s.
 */
const MODEL_PLURALS = {
  computer: 'computers',
  sync: 'syncs',
  error: 'errors',
  fault: 'faults',
  migration: 'migrations',
  message: 'messages',
  notification: 'notifications',
  device: 'devices',
  application: 'applications',
  project: 'projects',
  domain: 'domains',
  formula: 'formulas',
  property: 'properties',
  tag: 'tags',
  feature: 'features',
  attribute: 'attributes',
  singularities: 'singularities', // already plural
  stamps: 'stamps',
  deployments: 'deployments',
}

const MODEL_SINGULARS = Object.fromEntries(
  Object.entries(MODEL_PLURALS).map(([k, v]) => [v, k]),
)

export const pluralize = {
  plural: (word) =>
    MODEL_PLURALS[word] || (word.endsWith('s') ? word : `${word}s`),
  singular: (word) =>
    MODEL_SINGULARS[word] || (word.endsWith('s') ? word.slice(0, -1) : word),
}

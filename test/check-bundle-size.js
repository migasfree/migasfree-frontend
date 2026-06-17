import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const JS_DIR = path.resolve(__dirname, '../dist/spa/js')

const APP_LIMIT = 1000 * 1024 // 1000 KB
const SINGLE_LIMIT = 1500 * 1024 // 1500 KB

console.log('Checking JS bundle sizes against budgets...')
console.log(`Directory: ${JS_DIR}`)

if (!fs.existsSync(JS_DIR)) {
  console.error(`Error: Build directory not found: ${JS_DIR}`)
  process.exit(1)
}

const files = fs.readdirSync(JS_DIR)
let failed = false

for (const file of files) {
  if (!file.endsWith('.js')) continue

  const filePath = path.join(JS_DIR, file)
  const stats = fs.statSync(filePath)
  const size = stats.size
  const sizeKb = (size / 1024).toFixed(2)

  if (file.startsWith('app.')) {
    console.log(`- ${file}: ${sizeKb} KB (Limit: ${APP_LIMIT / 1024} KB)`)
    if (size > APP_LIMIT) {
      console.error(
        `  ❌ ERROR: app bundle exceeds limit of ${APP_LIMIT / 1024} KB!`,
      )
      failed = true
    } else {
      console.log('  ✅ OK')
    }
  } else {
    if (size > SINGLE_LIMIT) {
      console.error(
        `- ❌ ERROR: ${file} is ${sizeKb} KB, which exceeds the single file limit of ${SINGLE_LIMIT / 1024} KB!`,
      )
      failed = true
    } else if (size > 100 * 1024) {
      console.log(
        `- ${file}: ${sizeKb} KB (Limit: ${SINGLE_LIMIT / 1024} KB) - ✅ OK`,
      )
    }
  }
}

if (failed) {
  console.error('\n❌ Bundle size check failed! Budget limits exceeded.')
  process.exit(1)
} else {
  console.log('\n✅ Bundle size check passed successfully.')
}

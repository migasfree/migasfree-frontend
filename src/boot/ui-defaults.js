import { boot } from 'quasar/wrappers'
import { QInput, QSelect, QCard } from 'quasar'

function setPropDefault(component, propName, defaultValue) {
  const prop = component.props[propName]
  if (prop) {
    if (prop === Boolean || prop === String || prop === Number) {
      component.props[propName] = { type: prop, default: defaultValue }
    } else {
      component.props[propName].default = defaultValue
    }
  }
}

export default boot(() => {
  setPropDefault(QInput, 'outlined', true)
  setPropDefault(QInput, 'dense', true)

  setPropDefault(QSelect, 'outlined', true)
  setPropDefault(QSelect, 'dense', true)

  setPropDefault(QCard, 'flat', true)
  setPropDefault(QCard, 'bordered', true)

  console.log('Applied global defaults for QInput, QSelect, QCard')
})

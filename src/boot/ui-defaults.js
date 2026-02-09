import { boot } from 'quasar/wrappers'
import { QInput, QSelect, QCard } from 'quasar'

function setPropDefault(component, propName, defaultValue) {
  // eslint-disable-next-line security/detect-object-injection
  const prop = component.props[propName]
  if (prop) {
    if (prop === Boolean || prop === String || prop === Number) {
      // eslint-disable-next-line security/detect-object-injection
      component.props[propName] = { type: prop, default: defaultValue }
    } else {
      // eslint-disable-next-line security/detect-object-injection
      component.props[propName].default = defaultValue
    }
  }
}

export default boot(() => {
  setPropDefault(QInput, 'outlined', true)
  setPropDefault(QInput, 'dense', false)

  setPropDefault(QSelect, 'outlined', true)
  setPropDefault(QSelect, 'dense', false)

  setPropDefault(QCard, 'flat', true)
  setPropDefault(QCard, 'bordered', true)
})

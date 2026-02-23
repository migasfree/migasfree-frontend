import { boot } from 'quasar/wrappers'
import {
  QInput,
  QSelect,
  QCard,
  QCheckbox,
  QRadio,
  QToggle,
  QSlider,
  QChip,
} from 'quasar'

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
  // Inputs: filled style
  setPropDefault(QInput, 'filled', true)
  setPropDefault(QInput, 'outlined', false)
  setPropDefault(QInput, 'dense', false)

  // Selects: filled style
  setPropDefault(QSelect, 'filled', true)
  setPropDefault(QSelect, 'outlined', false)
  setPropDefault(QSelect, 'dense', false)

  // Cards: flat
  setPropDefault(QCard, 'flat', true)
  setPropDefault(QCard, 'bordered', false)

  // Selection Controls: Brand Primary
  setPropDefault(QCheckbox, 'color', 'primary')
  setPropDefault(QRadio, 'color', 'primary')
  setPropDefault(QToggle, 'color', 'primary')
  setPropDefault(QSlider, 'color', 'primary')

  // Chips: Standard Look
  setPropDefault(QChip, 'color', 'primary')
})

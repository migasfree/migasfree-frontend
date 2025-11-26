import { exportFile } from 'quasar'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'stores/ui'

export function useChartExport() {
  const { $gettext } = useGettext()
  const uiStore = useUiStore()

  const saveSvgImage = (chart, title) => {
    const linkSource = chart.getDataURL()
    const downloadLink = document.createElement('a')

    downloadLink.href = linkSource
    downloadLink.download = `${title}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const savePngImage = (chart, title) => {
    const svgDataUrl = chart.getDataURL()

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const rect = chart.getDom().getBoundingClientRect()
      const canvas = document.createElement('canvas')
      canvas.width = rect.width
      canvas.height = rect.height
      const ctx = canvas.getContext('2d')

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const pngDataUrl = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.href = pngDataUrl
      downloadLink.download = `${title}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      canvas.remove()
    }
    img.src = svgDataUrl
  }

  const wrapCsvValue = (val, formatFn, row) => {
    let formatted = formatFn !== void 0 ? formatFn(val, row) : val

    formatted =
      formatted === void 0 || formatted === null ? '' : String(formatted)

    formatted = formatted.split('"').join('""')

    return `"${formatted}"`
  }

  const exportTableToCsv = (filename, columns, data) => {
    const content = [columns.map((col) => wrapCsvValue(col.label))]
      .concat(
        data.map((row) =>
          columns
            .map((col) =>
              wrapCsvValue(
                typeof col.field === 'function'
                  ? col.field(row)
                  : row[col.field === void 0 ? col.name : col.field],
                col.format,
                row,
              ),
            )
            .join(','),
        ),
      )
      .join('\r\n')

    const status = exportFile(filename, content, 'text/csv')

    if (status !== true) {
      uiStore.notifyError($gettext('Browser denied file download...'))
    }

    return status
  }

  return {
    saveSvgImage,
    savePngImage,
    wrapCsvValue,
    exportTableToCsv,
  }
}

import { FC } from 'react'

import { Button, ButtonProps } from './Button'

interface CSVDownloadProps extends ButtonProps {
  data: string
  filename: string
}

export const CSVDownloadButton: FC<CSVDownloadProps> = ({ data, filename, ...props }) => {
  const handleDownload = () => {
    const csvData = new Blob([data], { type: 'text/csv' })
    const csvURL = window.URL.createObjectURL(csvData)

    const tempLink = document.createElement('a')
    tempLink.href = csvURL
    tempLink.download = filename
    tempLink.click()

    window.URL.revokeObjectURL(csvURL)
  }

  return (
    <Button onClick={handleDownload} {...props}>
      Download .CSV
    </Button>
  )
}

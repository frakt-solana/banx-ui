import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import { StatInfo } from '@banx/components/StatInfo'

import { convertCssVariablesToColors } from './helpers'

import styles from './ChartPie.module.less'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ChartPieProps {
  data: any[]
  colors: string[] //? css variables

  label?: string
  value?: number
  className?: string
}

export const ChartPie = ({ data: rawData, colors, label, value, className }: ChartPieProps) => {
  const options = {
    maintainAspectRatio: false,
    cutout: 55,
  }

  const data = {
    datasets: [
      {
        backgroundColor: convertCssVariablesToColors(colors) ?? [],
        borderWidth: 0,
        data: rawData,
      },
    ],
  }

  return (
    <div className={styles.chartWrapper}>
      <Doughnut data={data} options={options} className={className} />
      <div className={styles.innerContent}>
        {!!label && !!value ? <StatInfo value={value} label={label} decimalPlaces={0} /> : null}
      </div>
    </div>
  )
}

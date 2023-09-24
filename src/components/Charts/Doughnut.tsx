import { FC } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut as DoughnutChart } from 'react-chartjs-2'

import { StatInfo } from '@banx/components/StatInfo'

import { convertCssVariablesToColors } from './helpers'

import styles from './Charts.module.less'

ChartJS.register(ArcElement, Tooltip, Legend)

type ChartData = Array<number>
type ColorList = string[] // CSS variables

interface DoughnutChartProps {
  data: ChartData
  colors: ColorList
  statLabel?: string
  statValue?: number
  className?: string
}

export const Doughnut: FC<DoughnutChartProps> = ({
  data,
  colors,
  statLabel,
  statValue,
  className,
}) => {
  const options = generateOptions()
  const chartData = generateData(data, colors)

  return (
    <div className={styles.doughnutChartWrapper}>
      <DoughnutChart data={chartData} options={options} className={className} />
      <div className={styles.doughnutInnerContent}>
        {statLabel && statValue ? (
          <StatInfo value={statValue} label={statLabel} decimalPlaces={0} />
        ) : null}
      </div>
    </div>
  )
}

const generateOptions = () => ({
  maintainAspectRatio: false,
  cutout: 55,
})

const generateData = (data: ChartData, colors: ColorList) => ({
  datasets: [
    {
      backgroundColor: convertCssVariablesToColors(colors) ?? [],
      borderWidth: 0,
      data,
    },
  ],
})

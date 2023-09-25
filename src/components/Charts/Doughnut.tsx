import { FC } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import classNames from 'classnames'
import { Doughnut as DoughnutChart } from 'react-chartjs-2'

import { StatInfo, StatsInfoProps } from '@banx/components/StatInfo'

import { convertCssVariablesToColors } from './helpers'

import styles from './Charts.module.less'

ChartJS.register(ArcElement, Tooltip, Legend)

type ChartData = Array<number>
type ColorList = string[] // CSS variables

interface DoughnutChartProps {
  data: ChartData
  colors: ColorList
  statInfoProps: StatsInfoProps
  className?: string
}

export const Doughnut: FC<DoughnutChartProps> = ({ data, colors, statInfoProps, className }) => {
  const options = generateOptions()
  const chartData = generateData(data, colors)

  return (
    <div className={classNames(styles.doughnutChartWrapper, className)}>
      <DoughnutChart data={chartData} options={options} />
      <div className={styles.doughnutInnerContent}>
        {statInfoProps ? <StatInfo {...statInfoProps} /> : null}
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

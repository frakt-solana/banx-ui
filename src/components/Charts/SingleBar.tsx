import { FC } from 'react'

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import classNames from 'classnames'
import { Bar as ChartBar } from 'react-chartjs-2'

import { getCssVariableValue } from './helpers'
import { singleBaroptions } from './options'

import styles from './Charts.module.less'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type ChartData = Array<{
  label: string
  color: string
  key: string
  value: number
}>

interface SingleBarProps {
  data: ChartData
  className: string
}

export const SingleBar: FC<SingleBarProps> = ({ data, className }) => {
  const chartData = {
    labels: ['SingleBar'],
    datasets: data.map(({ label, value, color }) => {
      return {
        label,
        data: [value],
        backgroundColor: getCssVariableValue(color),
      }
    }),
  }

  return (
    <div className={classNames(styles.barChartWrapper, className)}>
      <ChartBar options={singleBaroptions} data={chartData} />
    </div>
  )
}

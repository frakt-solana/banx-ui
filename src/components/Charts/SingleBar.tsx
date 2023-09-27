import { FC, useEffect, useState } from 'react'

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

import { useTheme } from '@banx/hooks'

import { getCssVariableValue } from './helpers'
import { singleBarOptions } from './options'

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
  const { theme } = useTheme()
  const [bgColors, setBgColors] = useState<string[]>([])

  useEffect(() => {
    setBgColors(data.map(({ color }) => getCssVariableValue(color)))
  }, [theme, data])

  const chartData = {
    labels: [''],
    datasets: data.map(({ label, value }, index) => {
      return {
        label,
        data: [value],
        backgroundColor: bgColors[index],
      }
    }),
  }

  return (
    <div className={classNames(styles.barChartWrapper, className)}>
      <ChartBar options={singleBarOptions} data={chartData} />
    </div>
  )
}

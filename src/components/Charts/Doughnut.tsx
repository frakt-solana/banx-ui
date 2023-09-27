import { FC, useEffect, useState } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import classNames from 'classnames'
import { Doughnut as DoughnutChart } from 'react-chartjs-2'

import { StatInfo, StatsInfoProps } from '@banx/components/StatInfo'

import { useTheme } from '@banx/hooks'

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
  const { theme } = useTheme()

  const [bgColors, setBgColors] = useState<string[]>([])

  const options = {
    maintainAspectRatio: false,
    cutout: 55,
  }

  useEffect(() => {
    if (!colors?.length) return
    const convertedColors = convertCssVariablesToColors(colors)
    setBgColors(convertedColors)
  }, [theme, colors])

  const chartData = {
    datasets: [
      {
        backgroundColor: bgColors ?? [],
        borderWidth: 0,
        data,
      },
    ],
  }

  return (
    <div className={classNames(styles.doughnutChartWrapper, className)}>
      <DoughnutChart data={chartData} options={options} />
      <div className={styles.doughnutInnerContent}>
        {statInfoProps ? <StatInfo {...statInfoProps} /> : null}
      </div>
    </div>
  )
}

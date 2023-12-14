import { FC } from 'react'

import { map, slice, sum, sumBy } from 'lodash'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import styles from '../PlaceOfferContent.module.less'

interface DiagramProps {
  marks: number[]
}

const Diagram: FC<DiagramProps> = ({ marks }) => {
  const cumulativeSum = sumBy(marks)

  return (
    <div className={styles.diagram}>
      <div className={styles.diagramLine}>
        {map(marks, (value, index) => {
          const left = calculateLeftPercentage(marks, index, cumulativeSum)
          return <Mark key={index} value={value} left={left} />
        })}
      </div>
    </div>
  )
}

export default Diagram

interface MarkProps {
  left: number
  value: number
}
const Mark: FC<MarkProps> = ({ value, left }) => {
  return (
    <div style={{ left: `${left}%` }} className={styles.mark}>
      <div className={styles.square} />
      <div className={styles.dot} />
      <div className={styles.value}>{createSolValueJSX(value, 1, '0◎', formatDecimal)}</div>
    </div>
  )
}

const calculateLeftPercentage = (
  values: number[],
  currentIndex: number,
  totalLoanAmount: number,
) => {
  const accumulatedSum = sum(slice(values, 0, currentIndex + 1))
  return (accumulatedSum / totalLoanAmount) * 100
}

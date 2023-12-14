import { FC } from 'react'

import { map, slice, sum, sumBy } from 'lodash'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import styles from './Diagram.module.less'

interface Mark {
  loanValue: number
  loan?: Loan
}

interface DiagramProps {
  marks: Mark[] | undefined
}

const Diagram: FC<DiagramProps> = ({ marks }) => {
  const cumulativeSum = sumBy(marks, 'loanValue')
  const arrayLoanValues = map(marks, 'loanValue')

  return (
    <div className={styles.diagram}>
      <div className={styles.diagramLine}>
        {map(marks, (value, index) => {
          const left = calculateLeftPercentage(arrayLoanValues, index, cumulativeSum)
          return <Mark key={index} loan={value?.loan} value={value.loanValue} left={left} />
        })}
      </div>
    </div>
  )
}

export default Diagram

interface MarkProps {
  left: number
  value: number
  loan?: Loan
}
const Mark: FC<MarkProps> = ({ value, left, loan }) => {
  return (
    <div style={{ left: `calc(${left}% - 24px)` }} className={styles.mark}>
      <img src={loan ? loan?.nft.meta.imageUrl : ''} className={styles.square} />
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

import { FC } from 'react'

import { map, slice, sum } from 'lodash'

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
  const mappedLoanValues = map(marks, (mark) => mark.loanValue)
  const sumOfLoanValues = sum(mappedLoanValues)

  return (
    <div className={styles.diagram}>
      <div className={styles.diagramLine}>
        {map(marks, ({ loanValue, loan }, index) => {
          const left = calculateLeftPercentage(mappedLoanValues, index, sumOfLoanValues)
          return <DiagramMark key={index} loan={loan} value={loanValue} left={left} />
        })}
      </div>
    </div>
  )
}

export default Diagram

interface DiagramMarkProps {
  left: number
  value: number
  loan?: Loan
}
const DiagramMark: FC<DiagramMarkProps> = ({ value, left, loan }) => {
  const nftImage = loan?.nft.meta.imageUrl

  return (
    <div style={{ left: `calc(${left}% - 24px)` }} className={styles.mark}>
      {nftImage ? (
        <img src={nftImage} className={styles.square} />
      ) : (
        <div className={styles.square} />
      )}
      <div className={styles.dot} />
      <div className={styles.value}>{createSolValueJSX(value, 1e9, '0◎', formatDecimal)}</div>
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

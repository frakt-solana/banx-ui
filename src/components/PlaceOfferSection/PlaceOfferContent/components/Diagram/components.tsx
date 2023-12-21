import { FC } from 'react'

import { compact, first, isArray, last } from 'lodash'

import { createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { Loan } from '@banx/api/core'
import {
  HealthColorIncreasing,
  calcLoanBorrowedAmount,
  calculateLoanRepayValue,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import { Mark } from './Diagram'
import { calculateStyle } from './helpers'

import styles from './Diagram.module.less'

const TooltipHeader = () => (
  <div className={styles.tooltipHeaderContent}>
    <span className={styles.tooltipHeaderLabel}>Offer</span>
    <span className={styles.tooltipHeaderLabel}>LTV</span>
  </div>
)

const TooltipBody: FC<{ loans: Loan[] }> = ({ loans }) => (
  <div className={styles.tooltipBodyContent}>
    {loans.map((loan) => {
      const { nft, publicKey, totalRepaidAmount = 0 } = loan
      const collectionFloor = nft.collectionFloor
      const ltv = (calculateLoanRepayValue(loan) / collectionFloor) * 100
      const loanValue = calcLoanBorrowedAmount(loan) + totalRepaidAmount

      return (
        <div key={publicKey} className={styles.tooltipRowContent}>
          <img className={styles.nftImage} src={nft.meta.imageUrl} />
          <span>{formatDecimal(loanValue / 1e9)}◎</span>
          <span style={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}>
            {createPercentValueJSX(ltv)}
          </span>
        </div>
      )
    })}
  </div>
)

const createTooltip = (loans: Loan[]) => {
  if (loans.length) {
    return (
      <div className={styles.tooltip}>
        <TooltipHeader />
        <TooltipBody loans={loans} />
      </div>
    )
  }
  return null
}

const createSquareElement = (nftImage: string | undefined) => {
  if (nftImage) {
    return <img src={nftImage} className={styles.imageSquare} />
  }
  return <div className={styles.square} />
}

const createMarkCountBadge = (marks: Mark[]) => {
  if (marks.length > 1) {
    return <div className={styles.markCountBadge}>{marks.length}</div>
  }
  return null
}

interface DiagramMarkProps {
  left: number
  mark: Mark[] | Mark
}

export const DiagramMark: FC<DiagramMarkProps> = ({ mark, left }) => {
  const marks = isArray(mark) ? mark : [mark]

  const { loan: firstLoan, value: firstValue = 0 } = first(marks) || {}
  const { value: lastValue = 0 } = last(marks) || {}

  const nftImage = firstLoan?.nft.meta.imageUrl

  const formattedFirstValue = formatDecimal(firstValue / 1e9)
  const formattedLastValue = marks.length > 1 ? `- ${formatDecimal(lastValue / 1e9)}` : ''

  const loans = compact(marks.map((mark) => mark?.loan))
  const tooltipContent = createTooltip(loans)

  const commonMarkContent = (
    <div className={styles.mark} style={{ left: calculateStyle(left) }}>
      {createMarkCountBadge(marks)}
      {createSquareElement(nftImage)}
      <div className={styles.dot} />
      <div className={styles.value}>{`${formattedFirstValue} ${formattedLastValue}◎`}</div>
    </div>
  )

  return tooltipContent ? (
    <Tooltip title={tooltipContent}>{commonMarkContent}</Tooltip>
  ) : (
    commonMarkContent
  )
}

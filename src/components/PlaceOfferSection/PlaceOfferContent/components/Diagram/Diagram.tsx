import { FC } from 'react'

import { Skeleton } from 'antd'
import { first, isArray, last } from 'lodash'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import { calcLeftPercentage, groupMarks } from './helpers'

import styles from './Diagram.module.less'

export interface Mark {
  value: number
  loan?: Loan
}

interface DiagramProps {
  marks: Mark[]
  isLoading: boolean
}

const Diagram: FC<DiagramProps> = ({ marks = [], isLoading }) => {
  const groupedMarks = groupMarks(marks)

  return (
    <div className={styles.diagram}>
      {isLoading ? (
        <Skeleton.Input size="large" active block />
      ) : (
        <div className={styles.diagramLine}>
          {groupedMarks.map((mark, index) => {
            const left = calcLeftPercentage(groupedMarks, index)
            return <DiagramMark key={index} mark={mark} left={left} />
          })}
        </div>
      )}
    </div>
  )
}

export default Diagram

interface DiagramMarkProps {
  left: number
  mark: Mark[] | Mark
}

const DiagramMark: FC<DiagramMarkProps> = ({ mark, left }) => {
  const marks = isArray(mark) ? mark : [mark]

  const { loan: firstLoan, value: firstValue = 0 } = first(marks) || {}
  const { value: lastValue = 0 } = last(marks) || {}

  const nftImage = firstLoan?.nft.meta.imageUrl

  const formattedFirstValue = formatDecimal(firstValue / 1e9)
  const formattedLastValue = marks.length > 1 ? `-${formatDecimal(lastValue / 1e9)}` : ''

  const markCountBadge = marks.length > 1 && (
    <div className={styles.markCountBadge}>{marks.length}</div>
  )

  return (
    <div className={styles.mark} style={{ left: calculateStyle(left) }}>
      {markCountBadge}
      {createSquareElement(nftImage)}
      <div className={styles.dot} />
      <div className={styles.value}>{`${formattedFirstValue}${formattedLastValue}◎`}</div>
    </div>
  )
}

const calculateStyle = (left: number) => `calc(${left}% - 24px)`

const createSquareElement = (nftImage: string | undefined) => {
  if (nftImage) {
    return <img src={nftImage} className={styles.square} />
  } else {
    return <div className={styles.square} />
  }
}

import { FC } from 'react'

import { Skeleton } from 'antd'

import { Loan, MarketPreview } from '@banx/api/core'

import { DiagramMark } from './components'
import { calcLeftPercentage, groupMarks } from './helpers'

import styles from './Diagram.module.less'

export interface Mark {
  value: number
  loan?: Loan
}

interface DiagramProps {
  marks: Mark[]
  isLoading: boolean
  market: MarketPreview | undefined
}

export const Diagram: FC<DiagramProps> = ({ marks = [], isLoading, market }) => {
  const groupedMarks = groupMarks(marks)

  return (
    <div className={styles.diagramWrapper}>
      <div className={styles.diagram}>
        {isLoading ? (
          <Skeleton.Input size="large" active block />
        ) : (
          <div className={styles.diagramLine}>
            {groupedMarks.map((mark, index) => {
              const left = calcLeftPercentage(groupedMarks, index, market?.collectionFloor)
              return <DiagramMark key={index} mark={mark} left={left} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

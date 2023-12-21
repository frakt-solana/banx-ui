import { FC } from 'react'

import { Skeleton } from 'antd'

import { Loan } from '@banx/api/core'

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
}

export const Diagram: FC<DiagramProps> = ({ marks = [], isLoading }) => {
  const groupedMarks = groupMarks(marks)

  return (
    <div className={styles.diagramWrapper}>
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
    </div>
  )
}

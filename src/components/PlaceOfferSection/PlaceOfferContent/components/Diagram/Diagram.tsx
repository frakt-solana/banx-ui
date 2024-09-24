import React, { FC, useRef, useState } from 'react'

import { Skeleton } from 'antd'

import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'

import { DiagramMark } from './components'
import { calcLeftPercentage, groupMarks } from './helpers'

import styles from './Diagram.module.less'

export interface Mark {
  value: number
  loan?: core.Loan
}

interface DiagramProps {
  marks: Mark[]
  isLoading: boolean
}

export const Diagram: FC<DiagramProps> = ({ marks = [], isLoading }) => {
  const { tokenType } = useTokenType()
  const groupedMarks = groupMarks(marks)

  const [isScrolling, setIsScrolling] = useState(false)
  const [clientX, setClientX] = useState(0)
  const scrollContainer = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsScrolling(true)
    setClientX(event.clientX)
  }

  const handleMouseUp = () => {
    setIsScrolling(false)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isScrolling && scrollContainer.current) {
      const dx = event.clientX - clientX
      scrollContainer.current.scrollLeft -= dx
      setClientX(event.clientX)
    }
  }

  return (
    <div
      ref={scrollContainer}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={styles.diagramWrapper}
    >
      <div className={styles.diagram}>
        {isLoading ? (
          <Skeleton.Input size="large" active block />
        ) : (
          <div className={styles.diagramLine}>
            {groupedMarks.map((mark, index) => {
              const left = calcLeftPercentage(groupedMarks, index)
              return <DiagramMark key={index} mark={mark} left={left} tokenType={tokenType} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

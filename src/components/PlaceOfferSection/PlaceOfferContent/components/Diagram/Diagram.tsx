import { FC } from 'react'

import { map } from 'lodash'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import { calcLeftPercentage } from './helpers'

import styles from './Diagram.module.less'

export interface Mark {
  value: number
  loan?: Loan
}

interface DiagramProps {
  marks: Mark[]
}

const Diagram: FC<DiagramProps> = ({ marks }) => {
  const values = map(marks, (mark) => mark.value)

  return (
    <div className={styles.diagram}>
      <div className={styles.diagramLine}>
        {map(marks, ({ value, loan }, index) => {
          const left = calcLeftPercentage(values, index)
          return <DiagramMark key={index} loan={loan} value={value} left={left} />
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
    <div className={styles.mark} style={{ left: calculateStyle(left) }}>
      {createSquareElement(nftImage)}
      <div className={styles.dot} />
      <div className={styles.value}>{createSolValueJSX(value, 1e9, '0◎', formatDecimal)}</div>
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

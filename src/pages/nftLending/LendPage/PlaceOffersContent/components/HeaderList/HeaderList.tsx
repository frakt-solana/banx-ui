import { FC } from 'react'

import Tooltip from '@banx/components/Tooltip'

import styles from './HeaderList.module.less'

const HeaderList = () => {
  return (
    <div className={styles.container}>
      <Stat label="Collection" className={styles.mainStat} />

      <div className={styles.stats}>
        <Stat
          label="Floor"
          className={styles.additionalStat}
          tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
        />
        <Stat
          label="Top offer"
          className={styles.additionalStat}
          tooltipText="Highest offer among all lenders providing liquidity for this collection"
        />
        <Stat
          label="In loans"
          className={styles.additionalStat}
          tooltipText="Liquidity that is locked in active loans"
        />
        <Stat
          label="In offers"
          className={styles.additionalStat}
          tooltipText="Total liquidity currently available in pending offers"
        />
        <Stat
          label="Max APR"
          className={styles.additionalStat}
          tooltipText="Maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
        />
      </div>
    </div>
  )
}

export default HeaderList

interface StatProps {
  label: string
  tooltipText?: string
  className?: string
}

const Stat: FC<StatProps> = ({ label, tooltipText, className }) => (
  <div className={className}>
    <span className={styles.statLabel}>{label}</span>
    {tooltipText && <Tooltip title={tooltipText} />}
  </div>
)

import { FC } from 'react'

import Tooltip from '@banx/components/Tooltip'

import styles from './TokensListHeader.module.less'

const TokensListHeader = () => {
  return (
    <div className={styles.container}>
      <Stat label="Token" className={styles.mainStat} />

      <div className={styles.stats}>
        <Stat label="Price" className={styles.additionalStat} tooltipText="Token market price" />
        <Stat
          label="Top offer"
          className={styles.additionalStat}
          tooltipText="Highest offer among all lenders"
        />
        <Stat
          label="In loans"
          className={styles.additionalStat}
          tooltipText="Liquidity that is locked in active loans"
        />
        <Stat
          label="In offers"
          className={styles.additionalStat}
          tooltipText="Liquidity that is locked in active offers"
        />
        <Stat
          label="APR"
          className={styles.additionalStat}
          tooltipText="Annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization"
        />
        <Stat label="Status" className={styles.additionalStat} tooltipText="Status" />
      </div>
    </div>
  )
}

export default TokensListHeader

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

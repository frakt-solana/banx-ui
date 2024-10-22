import Tooltip from '@banx/components/Tooltip'

import styles from '../../InstantLoansContent.module.less'

export const HeaderList = () => {
  const stats = [
    { label: 'Size', tooltipText: 'Liquidity that is locked in active offers' },
    { label: 'APR' },
  ]

  return (
    <div className={styles.headerList}>
      <div className={styles.headerMainStat}>
        <span className={styles.headerStatLabel}>Token</span>
      </div>

      <div className={styles.headerStats}>
        {stats.map(({ label, tooltipText }, index) => (
          <div key={index} className={styles.headerAdditionalStat}>
            <span className={styles.headerStatLabel}>{label}</span>
            {tooltipText && <Tooltip title={tooltipText} />}
          </div>
        ))}
      </div>
    </div>
  )
}

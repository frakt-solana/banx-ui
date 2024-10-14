import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../TokenLoansContent.module.less'

export const HeaderList = () => {
  const stats = [
    { label: 'Price', tooltipText: TOOLTIP_TEXTS.PRICE },
    { label: 'Total debt', tooltipText: TOOLTIP_TEXTS.TOTAL_DEBT },
    { label: 'WLTV', tooltipText: TOOLTIP_TEXTS.WLTV },
    { label: 'WAPR', tooltipText: TOOLTIP_TEXTS.WAPR },
    { label: 'Status' },
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

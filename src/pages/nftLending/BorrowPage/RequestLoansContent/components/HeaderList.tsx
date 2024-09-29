import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../RequestLoansContent.module.less'

export const HeaderList = () => {
  const stats = [
    { label: 'Floor', tooltipText: TOOLTIP_TEXTS.FLOOR },
    { label: 'In loans', tooltipText: TOOLTIP_TEXTS.IN_LOANS },
    { label: 'Min APR', tooltipText: TOOLTIP_TEXTS.MIN_APR },
  ]

  return (
    <div className={styles.headerList}>
      <div className={styles.headerMainStat}>
        <span className={styles.headerStatLabel}>Collection</span>
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

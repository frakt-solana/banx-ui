import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../PlaceOffersContent.module.less'

export const HeaderList = () => {
  const stats = [
    { label: 'Floor', tooltipText: TOOLTIP_TEXTS.FLOOR },
    { label: 'Top offer', tooltipText: TOOLTIP_TEXTS.TOP_OFFER },
    { label: 'In loans', tooltipText: TOOLTIP_TEXTS.IN_LOANS },
    { label: 'Size', tooltipText: TOOLTIP_TEXTS.SIZE },
    { label: 'Max APR', tooltipText: TOOLTIP_TEXTS.MAX_APR },
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

import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../OffersTabContent.module.less'

export const HeaderTokensList = () => {
  const tokenStats = [
    { label: 'Floor', tooltipText: TOOLTIP_TEXTS.FLOOR },
    { label: 'Top offer', tooltipText: TOOLTIP_TEXTS.TOP_OFFER },
    { label: 'In offer', tooltipText: TOOLTIP_TEXTS.IN_OFFER },
    { label: 'Max offer', tooltipText: TOOLTIP_TEXTS.MAX_OFFER },
    { label: 'Max APR', tooltipText: TOOLTIP_TEXTS.MAX_APR },
  ]

  return (
    <div className={styles.headerTokensList}>
      <div className={styles.headerTokenMainStat}>
        <span className={styles.headerTokenStatLabel}>Collection</span>
      </div>

      <div className={styles.headerTokenStats}>
        {tokenStats.map(({ label, tooltipText }, index) => (
          <div key={index} className={styles.headerTokenAdditionalStat}>
            <span className={styles.headerTokenStatLabel}>{label}</span>
            {tooltipText && <Tooltip title={tooltipText} />}
          </div>
        ))}
      </div>
    </div>
  )
}

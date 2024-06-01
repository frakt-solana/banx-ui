import { FC, useMemo } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'

import styles from './Summary.module.less'

interface SummaryProps {
  offersPreview: core.TokenOfferPreview[]
}

const Summary: FC<SummaryProps> = ({ offersPreview }) => {
  const totalAccruedInterest = useMemo(
    () => sumBy(offersPreview, (offer) => offer.tokenOfferPreview.accruedInterest),
    [offersPreview],
  )

  return (
    <div className={styles.container}>
      <div className={styles.mainStat}>
        <p>
          <DisplayValue value={totalAccruedInterest} />
        </p>
        <p>Accrued interest</p>
      </div>
      <Button className={styles.claimButton} disabled={!totalAccruedInterest}>
        Claim
      </Button>
    </div>
  )
}

export default Summary

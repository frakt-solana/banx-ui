import { FC, useMemo } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'

import styles from './Summary.module.less'

interface SummaryProps {
  offers: core.TokenOfferPreview[]
}

const Summary: FC<SummaryProps> = ({ offers }) => {
  const totalAccruedInterest = useMemo(
    () => sumBy(offers, (offer) => offer.tokenOfferPreview.accruedInterest),
    [offers],
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

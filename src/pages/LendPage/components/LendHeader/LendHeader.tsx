import { useMemo } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import { AdditionalStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { formatNumbersWithCommas } from '@banx/utils'

import { useMarketsPreview } from '../../hooks'

import styles from './LendHeader.module.less'

const Header = () => {
  const { marketsPreview } = useMarketsPreview()

  const { loansTVL, offersTVL, totalLoans, totalOffers } = useMemo(() => {
    const sumByKey = (key: keyof MarketPreview) => sumBy(marketsPreview, key)

    return {
      loansTVL: sumByKey('loansTvl'),
      offersTVL: sumByKey('offerTvl'),
      totalLoans: sumByKey('activeBondsAmount'),
      totalOffers: sumByKey('activeOfferAmount'),
    }
  }, [marketsPreview])

  const formattedLoansTVL = formatNumbersWithCommas((loansTVL / 1e9)?.toFixed(0))
  const formattedOffersTVL = formatNumbersWithCommas((offersTVL / 1e9)?.toFixed(0))

  return (
    <PageHeaderBackdrop title="Lend" titleBtn={<OnboardButton contentType="lend" />}>
      <AdditionalStat
        label="Loan TVL"
        value={
          <>
            {formattedLoansTVL}◎
            <span className={styles.value}>in {formatNumbersWithCommas(totalLoans)} loans</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />

      <AdditionalStat
        label="Offer TVL"
        value={
          <>
            {formattedOffersTVL}◎
            <span className={styles.value}>in {formatNumbersWithCommas(totalOffers)} offers</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />
    </PageHeaderBackdrop>
  )
}

export default Header

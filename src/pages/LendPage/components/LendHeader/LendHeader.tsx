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

  const { loansTVL, offersTVL, totalLoans } = useMemo(() => {
    const sumByKey = (key: keyof MarketPreview) => sumBy(marketsPreview, key)

    return {
      loansTVL: sumByKey('loansTvl'),
      offersTVL: sumByKey('offerTvl'),
      totalLoans: sumByKey('activeBondsAmount'),
    }
  }, [marketsPreview])

  const formattedLoansTVL = formatNumbersWithCommas((loansTVL / 1e9)?.toFixed(0))

  return (
    <PageHeaderBackdrop title="Lend" titleBtn={<OnboardButton contentType="lend" title="Lend" />}>
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

      <AdditionalStat label="Offer TVL" value={offersTVL} divider={1e9} decimalPlaces={0} />
    </PageHeaderBackdrop>
  )
}

export default Header

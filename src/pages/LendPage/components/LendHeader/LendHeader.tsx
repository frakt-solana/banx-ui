import { sumBy } from 'lodash'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useMarketsPreview } from '../../hooks'

import styles from './LendHeader.module.less'

const Header = () => {
  const { marketsPreview } = useMarketsPreview()

  const loansTVL = sumBy(marketsPreview, 'loansTVL')
  const offersTVL = sumBy(marketsPreview, 'offerTVL')
  const totalLoans = sumBy(marketsPreview, 'activeBondsAmount')
  const totalOffers = sumBy(marketsPreview, 'activeOfferAmount')

  const formattedLoansTVL = createSolValueJSX(loansTVL, 1e9)
  const formattedOffersTVL = createSolValueJSX(offersTVL, 1e9)

  return (
    <PageHeaderBackdrop title="Lend">
      <AdditionalStat
        label="Loans volume"
        value={
          <>
            {formattedLoansTVL}
            <span className={styles.value}>in {totalLoans} loans</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />

      <AdditionalStat
        label="Offers volume"
        value={
          <>
            {formattedOffersTVL}
            <span className={styles.value}>in {totalOffers} offers</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />
      <SeparateStatsLine />
      <MainStat
        label="Whitelisted"
        value={marketsPreview?.length}
        valueType={VALUES_TYPES.STRING}
      />
    </PageHeaderBackdrop>
  )
}

export default Header

import { useMemo } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import { AdditionalStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

import { formatNumbersWithCommas } from '@banx/utils'

import { useMarketsPreview } from '../../../hooks'

import styles from './LendHeader.module.less'

const Header = () => {
  const { marketsPreview } = useMarketsPreview()

  const { loansTVL, offersTVL, totalLoans } = useMemo(() => {
    return {
      loansTVL: sumBy(marketsPreview, (m) => m.loansTvl.toNumber()),
      offersTVL: sumBy(marketsPreview, (m) => m.offerTvl.toNumber()),
      totalLoans: sumBy(marketsPreview, (m) => m.activeBondsAmount),
    }
  }, [marketsPreview])

  return (
    <PageHeaderBackdrop title="Lend" titleBtn={<OnboardButton contentType="lend" title="Lend" />}>
      <AdditionalStat
        label="Loan TVL"
        value={
          <>
            <DisplayValue value={loansTVL} />
            <span className={styles.value}>in {formatNumbersWithCommas(totalLoans)} loans</span>
          </>
        }
      />

      <AdditionalStat label="Offer TVL" value={<DisplayValue value={offersTVL} />} />
    </PageHeaderBackdrop>
  )
}

export default Header

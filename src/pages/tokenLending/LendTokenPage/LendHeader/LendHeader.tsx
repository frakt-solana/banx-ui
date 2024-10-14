import { useMemo } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import { AdditionalStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

import { formatNumbersWithCommas } from '@banx/utils'

import { useTokenMarketsPreview } from '../hooks'

import styles from './LendHeader.module.less'

const LendHeader = () => {
  const { marketsPreview } = useTokenMarketsPreview()

  const { loansTvl, totalLoans } = useMemo(() => {
    return {
      loansTvl: sumBy(marketsPreview, (market) => market.loansTvl),
      totalLoans: sumBy(marketsPreview, (market) => market.activeLoansAmount),
    }
  }, [marketsPreview])

  return (
    <PageHeaderBackdrop title="Lend" titleBtn={<OnboardButton contentType="lend" />}>
      <AdditionalStat
        label="Loan TVL"
        value={
          <>
            <DisplayValue value={loansTvl} />
            <span className={styles.value}>in {formatNumbersWithCommas(totalLoans)} loans</span>
          </>
        }
      />
    </PageHeaderBackdrop>
  )
}

export default LendHeader

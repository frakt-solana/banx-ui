import { useMemo } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import { AdditionalStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

import { core } from '@banx/api/nft'
import { formatNumbersWithCommas } from '@banx/utils'

import { useMarketsPreview } from '../../../hooks'

import styles from './LendHeader.module.less'

const Header = () => {
  const { marketsPreview } = useMarketsPreview()

  const { loansTVL, totalLoans } = useMemo(() => {
    const sumByKey = (key: keyof core.MarketPreview) => sumBy(marketsPreview, key)

    return {
      loansTVL: sumByKey('loansTvl'),
      totalLoans: sumByKey('activeBondsAmount'),
    }
  }, [marketsPreview])

  return (
    <PageHeaderBackdrop
      title="Lend"
      titleBtn={<OnboardButton contentType="lend" />}
      tokenSwitcher={<TokenSwitcher title="Lend" />}
    >
      <AdditionalStat
        label="Loan TVL"
        value={
          <>
            <DisplayValue value={loansTVL} />
            <span className={styles.value}>in {formatNumbersWithCommas(totalLoans)} loans</span>
          </>
        }
      />
    </PageHeaderBackdrop>
  )
}

export default Header

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

import { Snowflake } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'

const Header = () => {
  const { marketsPreview } = useMarketsPreview()

  const totalLiquidity = sumBy(marketsPreview, (offer) => offer.offerTvl)

  return (
    <PageHeaderBackdrop title="Borrow" titleBtn={<OnboardButton contentType="borrow" />}>
      <AdditionalStat
        label="Duration"
        value="Perpetual, 72h"
        tooltipText="As long as the borrower and lender are happy, the loan has no expiration. New loans benefit from a 72hr safety duration"
        icon={Snowflake}
      />

      <SeparateStatsLine />

      <MainStat label="Total liquidity" value={<DisplayValue value={totalLiquidity} />} />
    </PageHeaderBackdrop>
  )
}

export default Header

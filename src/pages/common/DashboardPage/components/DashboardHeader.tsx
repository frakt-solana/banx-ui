import { OnboardButton } from '@banx/components/Buttons'
import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

import { formatNumbersWithCommas } from '@banx/utils'

import { useAllTotalStats } from '../hooks'

const Header = () => {
  const { data } = useAllTotalStats()

  const { activeLoans = 0, totalValueLocked = 0, loansVolumeAllTime = 0 } = data || {}

  return (
    <PageHeaderBackdrop title="Dashboard" titleBtn={<OnboardButton contentType="dashboard" />}>
      <AdditionalStat label="Active loans" value={formatNumbersWithCommas(activeLoans)} />
      <AdditionalStat
        label="Total value locked"
        value={<DisplayValue value={totalValueLocked} />}
      />

      <SeparateStatsLine />

      <MainStat label="All time volume" value={<DisplayValue value={loansVolumeAllTime} />} />
    </PageHeaderBackdrop>
  )
}

export default Header

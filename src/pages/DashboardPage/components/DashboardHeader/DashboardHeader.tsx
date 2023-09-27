import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useAllTotalStats } from '../../hooks'

import styles from './DashboardHeader.module.less'

const Header = () => {
  const { data } = useAllTotalStats()

  const {
    dailyVolume = 0,
    activeLoans = 0,
    totalValueLocked = 0,
    loansVolumeAllTime = 0,
  } = data || {}

  return (
    <PageHeaderBackdrop className={styles.container} title="Dashboard">
      <AdditionalStat label="Daily volume" value={dailyVolume} divider={1e9} decimalPlaces={0} />
      <AdditionalStat label="Active loans" value={activeLoans} valueType={VALUES_TYPES.STRING} />
      <AdditionalStat
        label="Total value locked"
        value={totalValueLocked}
        divider={1e9}
        decimalPlaces={0}
      />

      <SeparateStatsLine />

      <MainStat
        label="Loans volume all time"
        value={loansVolumeAllTime}
        divider={1e9}
        decimalPlaces={0}
      />
    </PageHeaderBackdrop>
  )
}

export default Header

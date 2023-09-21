import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'

const Header = () => {
  const dailyVolume = 15_000 * 1e9
  const activeLoans = 20_000 * 1e9
  const totalValueLocked = 2_920_000 * 1e9
  const allLoansVolume = 192_213_275 * 1e9

  return (
    <PageHeaderBackdrop title="Dashboard">
      <AdditionalStat label="Daily volume" value={dailyVolume} divider={1e9} decimalPlaces={0} />
      <AdditionalStat label="Active loans" value={activeLoans} divider={1e9} decimalPlaces={0} />
      <AdditionalStat
        label="Total value locked"
        value={totalValueLocked}
        divider={1e9}
        decimalPlaces={0}
      />

      <SeparateStatsLine />

      <MainStat
        label="Loans volume all time"
        value={allLoansVolume}
        divider={1e9}
        decimalPlaces={0}
      />
    </PageHeaderBackdrop>
  )
}

export default Header

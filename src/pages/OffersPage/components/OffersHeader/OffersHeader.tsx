import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'

const OffersHeader = () => {
  //TODO: needs calculations
  const loansVolume = 145.5
  const offersVolume = 145.5
  const interest = 145.5
  const earned = 120.12

  return (
    <PageHeaderBackdrop title="My offers">
      <AdditionalStat label="Loans volume" value={loansVolume} />
      <AdditionalStat label="Offers volume" value={offersVolume} />
      <AdditionalStat label="Exp. interest" value={interest} />
      <SeparateStatsLine />
      <MainStat label="Earned" value={earned} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

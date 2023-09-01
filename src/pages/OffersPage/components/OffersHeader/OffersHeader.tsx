import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'

import { useUserOffersStats } from '../../hooks'

const OffersHeader = () => {
  const { data } = useUserOffersStats()

  const { loansVolume = 0, offersVolume = 0 } = data || {}

  //TODO: needs calculations
  const interest = 145.5
  const earned = 120.12

  return (
    <PageHeaderBackdrop title="My offers">
      <AdditionalStat label="Loans volume" value={loansVolume} divider={1e9} />
      <AdditionalStat label="Offers volume" value={offersVolume} divider={1e9} />
      <AdditionalStat label="Exp. interest" value={interest} />
      <SeparateStatsLine />
      <MainStat label="Earned" value={earned} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

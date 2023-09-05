import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'

import { useUserOffersStats } from '../../hooks'

const OffersHeader = () => {
  const { data } = useUserOffersStats()

  const { loansVolume = 0, offersVolume = 0, earned = 0 } = data || {}

  return (
    <PageHeaderBackdrop title="My offers">
      <AdditionalStat label="Loans volume" value={loansVolume} divider={1e9} />
      <AdditionalStat label="Offers volume" value={offersVolume} divider={1e9} />
      <SeparateStatsLine />
      <MainStat label="Earned" value={earned} divider={1e9} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

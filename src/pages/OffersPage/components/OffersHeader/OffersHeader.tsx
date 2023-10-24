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
      <AdditionalStat label="Loan TVL" value={loansVolume} divider={1e9} />
      <AdditionalStat label="Offer TVL" value={offersVolume} divider={1e9} />
      <SeparateStatsLine />
      <MainStat label="Earned" value={earned} divider={1e9} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

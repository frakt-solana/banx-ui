import { OnboardButton } from '@banx/components/Buttons'
import { AdditionalStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

import { useUserOffersStats } from '../../hooks'

const OffersHeader = () => {
  const { data } = useUserOffersStats()

  const { loansVolume = 0, offersVolume = 0 } = data || {}

  return (
    <PageHeaderBackdrop
      title="My offers"
      titleBtn={<OnboardButton contentType="offers" title="My offers" />}
    >
      <AdditionalStat label="Loan TVL" value={<DisplayValue value={loansVolume} />} />
      <AdditionalStat label="Offer TVL" value={<DisplayValue value={offersVolume} />} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

import { OnboardButton } from '@banx/components/Buttons'
import { MainStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useAuctionsLoans } from '../../hooks'

const RefinanceHeader = () => {
  const { loans } = useAuctionsLoans()

  return (
    <PageHeaderBackdrop
      title="Refinance"
      titleBtn={<OnboardButton contentType="refinance" title="Refinance" />}
    >
      <MainStat label="Available" value={loans.length} valueType={VALUES_TYPES.STRING} />
    </PageHeaderBackdrop>
  )
}

export default RefinanceHeader

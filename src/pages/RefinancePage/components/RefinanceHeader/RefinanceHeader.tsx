import { MainStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

const RefinanceHeader = () => {
  return (
    <PageHeaderBackdrop title="Refinance">
      <MainStat label="Available" value="25" valueType={VALUES_TYPES.STRING} />
    </PageHeaderBackdrop>
  )
}

export default RefinanceHeader

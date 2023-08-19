import { FC } from 'react'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

const LoansHeader: FC = () => {
  return (
    <PageHeaderBackdrop title="Loans">
      <AdditionalStat label="Loans" value="25" valueType={VALUES_TYPES.STRING} />
      <AdditionalStat label="Total borrowed" value="120" />
      <SeparateStatsLine />
      <MainStat label="Total debt" value="120" />
    </PageHeaderBackdrop>
  )
}

export default LoansHeader

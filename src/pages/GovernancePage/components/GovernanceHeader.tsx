import { FC } from 'react'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

const GovernanceHeader: FC = () => {
  //TODO: fetch total proposals and user partner points

  return (
    <PageHeaderBackdrop title="Governance">
      <AdditionalStat label="Proposals" value={'1'} valueType={VALUES_TYPES.STRING} />
      <SeparateStatsLine />
      <MainStat label="Partner points" value={'1'} valueType={VALUES_TYPES.STRING} />
    </PageHeaderBackdrop>
  )
}

export default GovernanceHeader

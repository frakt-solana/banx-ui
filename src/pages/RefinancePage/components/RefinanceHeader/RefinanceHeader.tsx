import { MainStat, PageHeaderBackdrop } from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useAuctionsLoans } from '../../hooks'

import styles from './RefinanceHeader.module.less'

const RefinanceHeader = () => {
  const { loans } = useAuctionsLoans()

  return (
    <PageHeaderBackdrop title="Refinance">
      <MainStat
        classNamesProps={{ container: styles.mainValue }}
        label="Available"
        value={loans.length}
        valueType={VALUES_TYPES.STRING}
      />
    </PageHeaderBackdrop>
  )
}

export default RefinanceHeader

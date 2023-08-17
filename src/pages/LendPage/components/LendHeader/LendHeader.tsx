import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import styles from './LendHeader.module.less'

const Header = () => {
  return (
    <PageHeaderBackdrop title="Lend">
      <AdditionalStat
        label="Loans volume"
        value={
          <>
            145◎
            <span className={styles.value}>in 64 loans</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />

      <AdditionalStat
        label="Offers volume"
        value={
          <>
            145◎
            <span className={styles.value}>in 64 offers</span>
          </>
        }
        valueType={VALUES_TYPES.STRING}
      />
      <SeparateStatsLine />
      <MainStat label="Total interest" value="45" />
    </PageHeaderBackdrop>
  )
}

export default Header

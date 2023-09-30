import { Button } from '@banx/components/Buttons'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { DashboardStatInfo, Heading } from '../../../components'
import { useAvailableToBorrow } from './hooks'

import styles from './AvailableToBorrow.module.less'

const AvailableToBorrow = () => {
  const {
    totalMarkets,
    totalLiquidity,
    userNFTs,
    maxBorrow,
    buttonProps,
    headingText,
    isConnected,
  } = useAvailableToBorrow()

  return (
    <div className={styles.availableToBorrow}>
      <Heading title={headingText} />
      <div className={styles.stats}>
        {isConnected ? (
          <>
            <DashboardStatInfo label="Borrow up to" value={maxBorrow} divider={1e9} />
            <DashboardStatInfo
              classNamesProps={{ value: styles.userNFTsValue }}
              label="From your"
              value={
                <>
                  {userNFTs} <span>NFTS</span>
                </>
              }
              valueType={VALUES_TYPES.STRING}
            />
          </>
        ) : (
          <>
            <DashboardStatInfo
              label="Collections whitelisted"
              value={totalMarkets}
              valueType={VALUES_TYPES.STRING}
            />
            <DashboardStatInfo
              label="Total liquidity"
              value={totalLiquidity}
              decimalPlaces={0}
              divider={1e9}
            />
          </>
        )}
      </div>
      <Button {...buttonProps}>{buttonProps.text}</Button>
    </div>
  )
}
export default AvailableToBorrow

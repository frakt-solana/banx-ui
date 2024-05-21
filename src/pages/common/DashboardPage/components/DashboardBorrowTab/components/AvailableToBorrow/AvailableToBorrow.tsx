import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'

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
        {isConnected && (
          <>
            <DashboardStatInfo label="Borrow up to" value={<DisplayValue value={maxBorrow} />} />
            <DashboardStatInfo
              classNamesProps={{ value: styles.userNFTsValue }}
              label="From your"
              value={
                <>
                  {userNFTs} <span>NFTS</span>
                </>
              }
            />
          </>
        )}

        {!isConnected && (
          <>
            <DashboardStatInfo label="Collections whitelisted" value={totalMarkets} />
            <DashboardStatInfo
              label="Total liquidity"
              value={<DisplayValue value={totalLiquidity} />}
            />
          </>
        )}
      </div>
      <Button {...buttonProps}>{buttonProps.text}</Button>
    </div>
  )
}
export default AvailableToBorrow

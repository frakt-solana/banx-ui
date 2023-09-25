import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { useWalletModal } from '@banx/components/WalletModal'

import { PATHS } from '@banx/router'

import { DashboardStatInfo, Heading } from '../components'

import styles from './DashboardBorrowTab.module.less'

interface AvailableToBorrowProps {
  totalMarkets: number
  totalLiquidity: number
  userNFTs: number
}

const AvailableToBorrow: FC<AvailableToBorrowProps> = ({
  totalMarkets,
  totalLiquidity,
  userNFTs,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const headingText = connected ? 'Borrow in bulk' : 'Available to borrow'
  const buttonText = connected ? 'Borrow $SOL in bulk' : 'Connect wallet to borrow $SOL'

  return (
    <div className={styles.availableToBorrow}>
      <Heading title={headingText} />

      <div className={styles.stats}>
        {connected ? (
          <>
            <DashboardStatInfo label="Borrow up to" value={124} />
            <DashboardStatInfo
              label="From your"
              value={`${userNFTs} NFTS`}
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

      {connected ? (
        <NavLink className={styles.button} to={PATHS.BORROW}>
          <Button className={styles.button}>{buttonText}</Button>
        </NavLink>
      ) : (
        <Button onClick={toggleVisibility} className={styles.button}>
          {buttonText}
        </Button>
      )}
    </div>
  )
}

export default AvailableToBorrow

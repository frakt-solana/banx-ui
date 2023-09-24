import React from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { DashboardStatInfo } from '../../../DashboardStatInfo'

import styles from './AvailableToBorrow.module.less'

const AvailableToBorrow = () => {
  const { connected } = useWallet()

  const headingText = connected ? 'Available to borrow' : 'Borrow in bulk'
  const buttonText = connected ? 'Connect wallet to borrow $SOL' : 'Borrow $SOL in bulk'

  return (
    <div>
      <h4 className={styles.heading}>{headingText}</h4>
      <div className={styles.stats}>
        {connected ? (
          <>
            <DashboardStatInfo label="Borrow up to" value={124} />
            <DashboardStatInfo
              label="From your"
              value={`${24} NFTS`}
              valueType={VALUES_TYPES.STRING}
            />
          </>
        ) : (
          <>
            <DashboardStatInfo label="Collections whitelisted" value={113} />
            <DashboardStatInfo label="Total liquidity" value={23169} />
          </>
        )}
      </div>
      <Button className={styles.button}>{buttonText}</Button>
    </div>
  )
}

export default AvailableToBorrow

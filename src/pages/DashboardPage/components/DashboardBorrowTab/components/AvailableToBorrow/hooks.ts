import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useWalletModal } from '@banx/components/WalletModal'

import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import { trackPageEvent } from '@banx/utils'

import styles from './AvailableToBorrow.module.less'

export const useAvailableToBorrow = () => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const navigate = useNavigate()

  const { marketsPreview } = useMarketsPreview()
  const { nfts, maxBorrow } = useBorrowNfts()

  const { totalMarkets, totalLiquidity, userNFTs } = useMemo(() => {
    return {
      totalMarkets: marketsPreview.length,
      totalLiquidity: sumBy(marketsPreview, 'offerTvl'),
      userNFTs: nfts.length,
    }
  }, [marketsPreview, nfts])

  const goToBorrowPage = () => {
    navigate(PATHS.BORROW)
  }

  const connectWalletHandler = () => {
    trackPageEvent('dashboard', 'connectwallet')
    toggleVisibility()
  }

  const buttonProps = {
    className: styles.button,
    onClick: connected ? goToBorrowPage : connectWalletHandler,
    text: connected ? 'Borrow SOL in bulk' : 'Connect wallet to borrow SOL',
  }

  const headingText = connected ? 'Borrow in bulk' : 'Available to borrow'

  return {
    totalMarkets,
    totalLiquidity,
    userNFTs,
    maxBorrow,
    buttonProps,
    headingText,
    isConnected: connected,
  }
}

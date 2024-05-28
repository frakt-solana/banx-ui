import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useWalletModal } from '@banx/components/WalletModal'

import { useBorrowNfts } from '@banx/pages/nftLending/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { PATHS } from '@banx/router'
import { createPathWithParams } from '@banx/store'
import { ModeType } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'

import styles from './AvailableToBorrow.module.less'

export const useAvailableToBorrow = () => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const navigate = useNavigate()

  const { marketsPreview } = useMarketsPreview()
  const { nfts, maxBorrow } = useBorrowNfts()

  const { tokenType } = useNftTokenType()

  const { totalMarkets, totalLiquidity, userNFTs } = useMemo(() => {
    return {
      totalMarkets: marketsPreview.length,
      totalLiquidity: sumBy(marketsPreview, 'offerTvl'),
      userNFTs: nfts.length,
    }
  }, [marketsPreview, nfts])

  const goToBorrowPage = () => {
    navigate(createPathWithParams(PATHS.BORROW, ModeType.NFT, tokenType))
  }

  const connectWalletHandler = () => {
    toggleVisibility()
  }

  const buttonProps = {
    className: styles.button,
    onClick: connected ? goToBorrowPage : connectWalletHandler,
    text: BUTTON_TEXT[tokenType][connected ? 'connected' : 'notConnected'],
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

const BUTTON_TEXT = {
  [LendingTokenType.NativeSol]: {
    connected: 'Borrow SOL in bulk',
    notConnected: 'Connect wallet to borrow SOL',
  },
  [LendingTokenType.BanxSol]: {
    connected: 'Borrow SOL in bulk',
    notConnected: 'Connect wallet to borrow SOL',
  },
  [LendingTokenType.Usdc]: {
    connected: 'Borrow USDC in bulk',
    notConnected: 'Connect wallet to borrow USDC',
  },
}

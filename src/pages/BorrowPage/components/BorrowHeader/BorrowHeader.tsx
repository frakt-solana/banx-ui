import { useWallet } from '@solana/wallet-adapter-react'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useBorrowNfts } from '../../hooks'

const Header = () => {
  const { connected } = useWallet()
  const { nfts, maxBorrow } = useBorrowNfts()

  const nftsAmount = nfts.length

  //? Waiting for BE
  const collectionsWhitelisted = 10
  const totalLiquidity = 28323169

  return (
    <PageHeaderBackdrop title="Borrow SOL">
      {connected ? (
        <AdditionalStat label="Your NFTs" value={nftsAmount} valueType={VALUES_TYPES.STRING} />
      ) : (
        <AdditionalStat
          label="Collections whitelisted"
          value={collectionsWhitelisted}
          valueType={VALUES_TYPES.STRING}
        />
      )}

      <AdditionalStat label="Duration" value="Perpetual, 72h" valueType={VALUES_TYPES.STRING} />
      <SeparateStatsLine />

      {connected ? (
        <MainStat label="Max borrow" value={maxBorrow} divider={1e9} />
      ) : (
        <MainStat label="Total liquidity" value={totalLiquidity} decimalPlaces={0} />
      )}
    </PageHeaderBackdrop>
  )
}

export default Header

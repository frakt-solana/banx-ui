import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { useBorrowNfts } from '../../hooks'

const Header = () => {
  const { connected } = useWallet()

  const { nfts, maxBorrow } = useBorrowNfts()
  const { marketsPreview } = useMarketsPreview()

  const nftsAmount = nfts.length

  const collectionsWhitelisted = marketsPreview?.length
  const totalLiquidity = sumBy(marketsPreview, 'offerTVL')

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
        <MainStat label="Total liquidity" value={totalLiquidity} divider={1e9} />
      )}
    </PageHeaderBackdrop>
  )
}

export default Header

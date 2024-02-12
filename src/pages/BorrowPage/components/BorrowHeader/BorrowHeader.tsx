import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { Snowflake } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { useBorrowNfts } from '../../hooks'

const Header = () => {
  const { connected } = useWallet()

  const { nfts, maxBorrow } = useBorrowNfts()
  const { marketsPreview } = useMarketsPreview()

  const nftsAmount = nfts.length
  const totalLiquidity = sumBy(marketsPreview, (offer) => offer.offerTvl)

  return (
    <PageHeaderBackdrop
      title="Borrow"
      titleBtn={<OnboardButton title="Borrow" contentType="borrow" />}
    >
      {connected && (
        <AdditionalStat label="Your NFTs" value={nftsAmount} valueType={VALUES_TYPES.STRING} />
      )}

      <AdditionalStat
        label="Duration"
        value="Perpetual, 72h"
        valueType={VALUES_TYPES.STRING}
        tooltipText="As long as the borrower and lender are happy, the loan has no expiration. New loans benefit from a 72hr safety duration"
        icon={Snowflake}
      />

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

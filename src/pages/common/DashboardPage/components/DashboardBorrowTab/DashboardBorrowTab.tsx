import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { ModeType, useModeType } from '@banx/store/common'

import { useBorrowerStats } from '../../hooks'
import { CollectionCard, TokenCard } from '../Card'
import { SearchableHeading } from '../components'
import AvailableToBorrow from './components/AvailableToBorrow'
import MyLoans from './components/MyLoans'
import { useFilteredNftsMarkets, useFilteredTokensMarkets } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const { connected } = useWallet()
  const { modeType } = useModeType()

  const { data: borrowerStats } = useBorrowerStats()

  return (
    <>
      {modeType === ModeType.NFT && <CollectionsSection />}
      {modeType === ModeType.Token && <TokensSection />}

      <div className={classNames(styles.additionalSection, { [styles.fixedHeight]: !connected })}>
        <AvailableToBorrow />
        {connected && <MyLoans stats={borrowerStats} />}
      </div>
    </>
  )
}

export default DashboardBorrowTab

const TokensSection = () => {
  const { marketsPreview, isLoading } = useTokenMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredTokensMarkets(marketsPreview)

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: filteredMarkets })

  return (
    <div className={styles.nftsSection}>
      <SearchableHeading title="Tokens" searchSelectParams={searchSelectParams} />

      {!isLoading && filteredMarkets.length && (
        <div className={styles.cardsList}>
          {data.map((market) => (
            <TokenCard key={market.marketPubkey} market={market} />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

const CollectionsSection = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredNftsMarkets(marketsPreview)

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: filteredMarkets })

  return (
    <div className={styles.nftsSection}>
      <SearchableHeading title="Collections" searchSelectParams={searchSelectParams} />

      {isLoading && <Loader />}

      {!isLoading && filteredMarkets.length && (
        <div className={styles.cardsList}>
          {data.map((market) => (
            <CollectionCard key={market.marketPubkey} market={market} />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

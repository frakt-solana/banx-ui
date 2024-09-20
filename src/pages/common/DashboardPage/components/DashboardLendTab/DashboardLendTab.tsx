import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { ModeType, useModeType } from '@banx/store/common'

import { useLenderStats } from '../../hooks'
import { LendCollectionCard, LendTokenCard } from '../Card'
import { SearchableHeading } from '../components'
import AllTimeBlock from './components/AllTimeBlock'
import AllocationBlock from './components/AllocationBlock'
import { useFilteredNftsMarkets, useFilteredTokensMarkets } from './hooks'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()
  const { modeType } = useModeType()

  const { data: lenderStats } = useLenderStats()

  return (
    <>
      {modeType === ModeType.NFT && <CollectionsSection />}
      {modeType === ModeType.Token && <TokensSection />}

      {connected && (
        <div className={styles.additionalContentSection}>
          <AllocationBlock stats={lenderStats?.allocation} />
          <AllTimeBlock stats={lenderStats?.allTime} />
        </div>
      )}
    </>
  )
}

export default DashboardLendTab

const TokensSection = () => {
  const { connected } = useWallet()
  const { marketsPreview, isLoading } = useTokenMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredTokensMarkets(marketsPreview)

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: filteredMarkets })

  return (
    <div className={classNames(styles.section, { [styles.fullWidth]: !connected })}>
      <SearchableHeading title="Tokens" searchSelectParams={searchSelectParams} />

      {!isLoading && filteredMarkets.length && (
        <div className={styles.cardsList}>
          {data.map((market) => (
            <LendTokenCard key={market.marketPubkey} market={market} />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

const CollectionsSection = () => {
  const { connected } = useWallet()
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredNftsMarkets(marketsPreview)

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: filteredMarkets })

  return (
    <div className={classNames(styles.section, { [styles.fullWidth]: !connected })}>
      <SearchableHeading title="Collections" searchSelectParams={searchSelectParams} />

      {isLoading && <Loader />}

      {!isLoading && filteredMarkets.length && (
        <div className={styles.cardsList}>
          {data.map((market) => (
            <LendCollectionCard key={market.marketPubkey} market={market} />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

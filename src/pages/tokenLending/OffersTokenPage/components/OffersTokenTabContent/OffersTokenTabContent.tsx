import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferTokenCard from '../OfferTokenCard'
import TokensListHeader from '../TokensListHeader'
import { useOffersTokenContent } from './hooks'

import styles from './OffersTokenTabContent.module.less'

const OffersTokenTabContent = () => {
  const { connected } = useWallet()

  const {
    offersToDisplay,
    isLoading,
    searchSelectParams,
    sortParams,
    emptyListParams,
    visibleOfferPubkey,
    showEmptyList,
    onCardClick,
    selectedCategory,
    onChangeCategory,
  } = useOffersTokenContent()

  return (
    <div className={classNames(styles.content, { [styles.emptyContent]: showEmptyList })}>
      {connected && (
        <>
          <FilterSection
            searchSelectParams={searchSelectParams}
            sortParams={sortParams}
            selectedCategory={selectedCategory}
            onChangeCategory={onChangeCategory}
          />
          <TokensListHeader />
        </>
      )}

      {showEmptyList && <EmptyList {...emptyListParams} />}

      {connected && isLoading && <Loader />}

      {connected && !isLoading && (
        <div className={styles.offersList}>
          {offersToDisplay.map((offerPreview) => (
            <OfferTokenCard
              key={offerPreview.publicKey}
              offerPreview={offerPreview}
              onToggleCard={() => onCardClick(offerPreview.publicKey)}
              isOpen={visibleOfferPubkey === offerPreview.publicKey}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OffersTokenTabContent

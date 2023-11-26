import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import Summary from './components/Summary'
import { useOffersTabContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const {
    data: loansAndOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
  } = useOffersTabContent()

  return (
    <div className={styles.content}>
      {isLoading && <Loader />}

      {!isLoading && !!loansAndOffers.length && (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />
          <div className={styles.cardsList}>
            {loansAndOffers.map((data) => (
              <OfferCard key={data.offer.publicKey} {...data} />
            ))}
          </div>
          <Summary
            updateOrAddLoan={() => null}
            addMints={() => null}
            loansToClaim={[]}
            loansToTerminate={[]}
          />
        </>
      )}

      {showEmptyList && <EmptyList message="Lend SOL to view your pending offers" />}
    </div>
  )
}

export default OffersTabContent

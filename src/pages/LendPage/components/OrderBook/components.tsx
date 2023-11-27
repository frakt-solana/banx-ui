import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimBondOfferInterestAction } from '@banx/transactions/bonds'
import { enqueueSnackbar, formatDecimal } from '@banx/utils'

import OfferComponent from '../Offer'
import { OrderBookParams } from './hooks'

import styles from './OrderBook.module.less'

interface OrderBookListProps {
  orderBookParams: OrderBookParams
  closeOrderBook?: () => void
  className?: string
}

export const OrderBookList: FC<OrderBookListProps> = ({
  orderBookParams,
  closeOrderBook,
  className,
}) => {
  const { syntheticOffers, goToEditOffer, bestOffer, isLoading } = orderBookParams

  return (
    <ul className={classNames(styles.orderBookList, className)}>
      {isLoading ? (
        <Loader size="small" />
      ) : (
        syntheticOffers.map((offer) => (
          <OfferComponent
            key={offer.publicKey}
            offer={offer}
            editOffer={() => {
              goToEditOffer(offer)
              closeOrderBook?.()
            }}
            bestOffer={bestOffer}
          />
        ))
      )}
    </ul>
  )
}

interface CollapsedMobileContentProps {
  collectionName?: string
  collectionImage?: string
  totalUserOffers?: number
  isOrderBookOpen: boolean
  onToggleVisible: () => void
}

export const CollapsedMobileContent: FC<CollapsedMobileContentProps> = ({
  collectionName = '',
  collectionImage = '',
  totalUserOffers = 0,
  isOrderBookOpen,
  onToggleVisible,
}) => (
  <div className={styles.collapsedContentWrapper}>
    <div className={styles.collapsedMobileContent}>
      <img className={styles.collapsedMobileImage} src={collectionImage} />
      <div className={styles.collectionMobileInfo}>
        <p className={styles.collectionMobileTitle}>{collectionName} offers</p>
        <p className={styles.collectionMobileSubtitle}>Mine: {totalUserOffers}</p>
      </div>
    </div>
    <Button
      type="circle"
      variant="secondary"
      onClick={onToggleVisible}
      className={classNames(styles.chevronButton, { [styles.active]: isOrderBookOpen })}
    >
      <ChevronDown />
    </Button>
  </div>
)

interface AccruedInterestProps {
  offers: Offer[]
  updateOrAddOffer: (offer: Offer) => void
}

export const AccruedInterest: FC<AccruedInterestProps> = ({ offers, updateOrAddOffer }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const totalClaimValue = sumBy(offers, 'concentrationIndex')

  const claimInterest = () => {
    const txnParams = offers.map((optimisticOffer) => ({ optimisticOffer }))

    new TxnExecutor(makeClaimBondOfferInterestAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          enqueueSnackbar({
            message: 'Interest successfully claimed',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })

          if (result) {
            updateOrAddOffer(result.bondOffer)
          }
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'ClaimOfferInterest',
        })
      })
      .execute()
  }

  return (
    <div className={styles.accruedInterestContainer}>
      <div className={styles.accruedInterestInfo}>
        <span className={styles.accruedInterestValue}>
          {createSolValueJSX(totalClaimValue, 1e9, '0◎', formatDecimal)}
        </span>
        <span className={styles.accruedInterestLabel}>Total accrued interest</span>
      </div>
      <Button onClick={claimInterest} disabled={!totalClaimValue}>
        Claim
      </Button>
    </div>
  )
}

interface OrderBookLabelsProps {
  className?: string
}
export const OrderBookLabels: FC<OrderBookLabelsProps> = ({ className }) => (
  <div className={classNames(styles.labels, className)}>
    <span>Offers</span>
    <span>Number of loans</span>
  </div>
)

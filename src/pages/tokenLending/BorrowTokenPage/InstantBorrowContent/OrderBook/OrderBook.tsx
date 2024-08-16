import { FC, useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { maxBy } from 'lodash'

import Table from '@banx/components/Table'

import { BorrowOffer } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { useSelectedOffers } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'
import { createRowStyle } from './helpers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BorrowOffer[]
  isLoading: boolean
}

const OrderBook: FC<OrderBookProps> = ({ offers, isLoading }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const {
    selection,
    toggle: toggleOfferInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedOffers()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const walletSelectedOffers = useMemo(() => {
    if (!walletPublicKeyString) return []
    return selection.filter(({ wallet }) => wallet === walletPublicKeyString)
  }, [selection, walletPublicKeyString])

  const hasSelectedOffers = !!walletSelectedOffers?.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedOffers) {
      clearSelection()
    } else {
      setSelection(offers, walletPublicKeyString)
    }
  }, [clearSelection, hasSelectedOffers, offers, setSelection, walletPublicKeyString])

  const findOfferInSelection = useCallback(
    (offerPubkey: string) => find(offerPubkey, walletPublicKeyString),
    [find, walletPublicKeyString],
  )

  const onRowClick = useCallback(
    (offer: BorrowOffer) => toggleOfferInSelection(offer, walletPublicKeyString),
    [toggleOfferInSelection, walletPublicKeyString],
  )

  const columns = getTableColumns({
    onSelectAll,
    findOfferInSelection,
    toggleOfferInSelection: onRowClick,
    hasSelectedOffers,
  })

  const maxOffer = useMemo(
    () => maxBy(offers, (offer) => parseFloat(offer.maxTokenToGet)),
    [offers],
  )

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: () => true,
          style: (offer: BorrowOffer) => (maxOffer ? createRowStyle(offer, maxOffer) : {}),
        },
      ],
    }
  }, [maxOffer, onRowClick])

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        emptyMessage={!offers.length ? 'No offers' : ''}
        loading={isLoading}
      />
    </div>
  )
}

export default OrderBook

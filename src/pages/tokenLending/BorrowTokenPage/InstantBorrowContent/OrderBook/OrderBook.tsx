import { FC, useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/Table'

import { Offer } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'

import { useSelectedOffers } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'
import { calcOfferLtv } from './helpers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  marketPubkey: string
  collateral: CollateralToken | undefined
  ltvTreshold: number
}

const OrderBook: FC<OrderBookProps> = ({ marketPubkey, collateral, ltvTreshold }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { offers: rawOffers, isLoading } = useTokenMarketOffers(marketPubkey)

  const { tokenType } = useNftTokenType()

  const {
    selection,
    toggle: toggleOfferInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedOffers()

  const offers = useMemo(() => {
    return rawOffers
      .filter((offer) => calcOfferLtv(offer, collateral) <= ltvTreshold)
      .sort((offerA, offerB) => calcOfferLtv(offerB, collateral) - calcOfferLtv(offerA, collateral))
  }, [collateral, ltvTreshold, rawOffers])

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
    (offer: Offer) => toggleOfferInSelection(offer, walletPublicKeyString),
    [toggleOfferInSelection, walletPublicKeyString],
  )

  const columns = getTableColumns({
    onSelectAll,
    findOfferInSelection,
    toggleOfferInSelection: onRowClick,
    hasSelectedOffers,
    collateral,
  })

  const rowParams = useMemo(() => {
    return { onRowClick }
  }, [onRowClick])

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

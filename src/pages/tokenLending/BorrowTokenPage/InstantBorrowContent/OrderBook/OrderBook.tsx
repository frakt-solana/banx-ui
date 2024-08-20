import { FC, useCallback, useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'
import { maxBy } from 'lodash'

import Table from '@banx/components/Table'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { ZERO_BN, getTokenDecimals, stringToBN, sumBNs } from '@banx/utils'

import { useSelectedOffers } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'
import { createRowStyle, getUpdatedBorrowOffers } from './helpers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BorrowOffer[]
  isLoading: boolean
  maxCollateralAmount: string //? input value string
  collateral: CollateralToken | undefined
}

const OrderBook: FC<OrderBookProps> = ({ offers, isLoading, maxCollateralAmount, collateral }) => {
  const { tokenType } = useNftTokenType()

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const {
    selection,
    toggle: toggleOfferInSelection,
    find: findOfferInSelection,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedOffers()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const hasSelectedOffers = !!selection?.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedOffers) return clearSelection()

    const collateralTokenDecimals = collateral?.collateral.decimals || 0
    const collateralsAmount = stringToBN(maxCollateralAmount, marketTokenDecimals)

    const updatedOffers = getUpdatedBorrowOffers({
      collateralsAmount,
      offers,
      tokenDecimals: collateralTokenDecimals,
    })

    setSelection(updatedOffers)
  }, [
    collateral,
    offers,
    hasSelectedOffers,
    marketTokenDecimals,
    maxCollateralAmount,
    clearSelection,
    setSelection,
  ])

  const restCollateralsAmount = useMemo(() => {
    const collateralsAmountInCart = sumBNs(
      selection.map((offer) => new BN(offer.maxCollateralToReceive)),
    )

    const collateralsAmount = stringToBN(maxCollateralAmount, marketTokenDecimals)

    return BN.max(collateralsAmount.sub(collateralsAmountInCart), ZERO_BN)
  }, [maxCollateralAmount, marketTokenDecimals, selection])

  const onRowClick = useCallback(
    (offer: BorrowOffer) => {
      if (!findOfferInSelection(offer.publicKey) && restCollateralsAmount.isZero()) return

      const collateralTokenDecimals = collateral?.collateral.decimals || 0

      const updatedOffer = getUpdatedBorrowOffers({
        collateralsAmount: restCollateralsAmount,
        offers: [offer],
        tokenDecimals: collateralTokenDecimals,
      })[0]

      return toggleOfferInSelection(updatedOffer)
    },
    [collateral, findOfferInSelection, restCollateralsAmount, toggleOfferInSelection],
  )

  const columns = getTableColumns({
    onSelectAll,
    findOfferInSelection,
    toggleOfferInSelection: onRowClick,
    hasSelectedOffers,
    restCollateralsAmount,
    tokenType,
    collateral,
  })

  const offerWithHighestOfferSize = useMemo(
    () => maxBy(offers, (offer) => parseFloat(offer.maxTokenToGet)),
    [offers],
  )

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: () => true,
          styles: (offer: BorrowOffer) => createRowStyle(offer, offerWithHighestOfferSize),
        },
      ],
    }
  }, [offerWithHighestOfferSize, onRowClick])

  const emptyMessage = !offers.length ? 'Not found suitable offers' : ''

  const loading = isLoading && !stringToBN(maxCollateralAmount, marketTokenDecimals).isZero()

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        emptyMessage={emptyMessage}
        loading={loading}
      />
    </div>
  )
}

export default OrderBook

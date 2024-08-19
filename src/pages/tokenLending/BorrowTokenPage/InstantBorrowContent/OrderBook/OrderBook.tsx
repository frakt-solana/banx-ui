import { FC, useCallback, useEffect, useMemo } from 'react'

import { maxBy, sumBy } from 'lodash'

import Table from '@banx/components/Table'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { useSelectedOffers } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'
import { createRowStyle, getUpdatedBorrowOffers } from './helpers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BorrowOffer[]
  isLoading: boolean
  maxCollateralAmount: number
  collateral: CollateralToken | undefined
}

const OrderBook: FC<OrderBookProps> = ({ offers, isLoading, maxCollateralAmount, collateral }) => {
  const { tokenType } = useNftTokenType()

  const marketTokenDecimals = getTokenDecimals(tokenType)

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
    if (hasSelectedOffers) {
      clearSelection()
    } else {
      const collateralTokenDecimals = collateral?.collateral.decimals || 0
      const collateralsAmount = maxCollateralAmount * marketTokenDecimals

      const updatedOffers = getUpdatedBorrowOffers({
        collateralsAmount,
        offers,
        tokenDecimals: collateralTokenDecimals,
      })

      setSelection(updatedOffers)
    }
  }, [
    clearSelection,
    collateral,
    hasSelectedOffers,
    marketTokenDecimals,
    maxCollateralAmount,
    offers,
    setSelection,
  ])

  const restCollateralsAmount = useMemo(() => {
    const collateralsAmountInCart = sumBy(selection, (offer) =>
      parseFloat(offer.maxCollateralToReceive),
    )

    const maxCollateralAmountWithDecimals = maxCollateralAmount * marketTokenDecimals

    return Math.max(maxCollateralAmountWithDecimals - collateralsAmountInCart, 0)
  }, [marketTokenDecimals, maxCollateralAmount, selection])

  const onRowClick = useCallback(
    (offer: BorrowOffer) => {
      if (!findOfferInSelection(offer.publicKey) && restCollateralsAmount === 0) return

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
          style: (offer: BorrowOffer) => createRowStyle(offer, offerWithHighestOfferSize),
        },
      ],
    }
  }, [offerWithHighestOfferSize, onRowClick])

  const emptyMessage = !offers.length ? 'Not found suitable offers' : ''

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        emptyMessage={emptyMessage}
        loading={isLoading && !!maxCollateralAmount}
      />
    </div>
  )
}

export default OrderBook

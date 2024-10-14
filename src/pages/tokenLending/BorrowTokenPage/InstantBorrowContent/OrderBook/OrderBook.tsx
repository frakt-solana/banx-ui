import { FC, useCallback, useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'
import { maxBy } from 'lodash'

import Table from '@banx/components/Table'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { ZERO_BN, getTokenDecimals, stringToBN, sumBNs } from '@banx/utils'

import { useSelectedOffers } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'
import { createRowStyle, getUpdatedBorrowOffers } from './helpers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BorrowOffer[]
  requiredCollateralsAmount: string //? input value string
  collateral: CollateralToken | undefined
}

const OrderBook: FC<OrderBookProps> = ({ offers, requiredCollateralsAmount, collateral }) => {
  const { tokenType } = useTokenType()

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
    const collateralsAmount = stringToBN(requiredCollateralsAmount, collateralTokenDecimals)

    const updatedOffers = getUpdatedBorrowOffers({
      collateralsAmount,
      offers,
      tokenDecimals: marketTokenDecimals,
    })

    setSelection(updatedOffers)
  }, [
    hasSelectedOffers,
    clearSelection,
    collateral?.collateral.decimals,
    requiredCollateralsAmount,
    offers,
    marketTokenDecimals,
    setSelection,
  ])

  const restCollateralsAmount = useMemo(() => {
    const collateralsAmountInCart = sumBNs(
      selection.map((offer) => new BN(offer.maxCollateralToReceive)),
    )

    const collateralsAmount = stringToBN(
      requiredCollateralsAmount,
      collateral?.collateral.decimals || 0,
    )

    return BN.max(collateralsAmount.sub(collateralsAmountInCart), ZERO_BN)
  }, [selection, requiredCollateralsAmount, collateral?.collateral.decimals])

  const onRowClick = useCallback(
    (offer: BorrowOffer) => {
      if (!findOfferInSelection(offer.id) && restCollateralsAmount.isZero()) return

      const updatedOffer = getUpdatedBorrowOffers({
        collateralsAmount: restCollateralsAmount,
        offers: [offer],
        tokenDecimals: marketTokenDecimals,
      })[0]

      return toggleOfferInSelection(updatedOffer)
    },
    [findOfferInSelection, marketTokenDecimals, restCollateralsAmount, toggleOfferInSelection],
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

  return (
    <Table
      data={offers}
      columns={columns}
      rowParams={rowParams}
      className={styles.table}
      classNameTableWrapper={styles.tableWrapper}
    />
  )
}

export default OrderBook

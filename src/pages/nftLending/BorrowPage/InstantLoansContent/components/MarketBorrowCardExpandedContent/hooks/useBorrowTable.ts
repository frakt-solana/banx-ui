import { useCallback, useMemo, useState } from 'react'

import { chain, isEmpty } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { core } from '@banx/api/nft'
import { ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, ViewState, useTableView, useTokenType } from '@banx/store/common'
import { NftWithLoanValue, calculateInterestOnBorrow } from '@banx/utils'

import { getTableColumns } from '../getTableColumns'
import { useBorrowNftTransactions } from './useBorrowNftTransactions'
import { useBorrowNftsQuery } from './useBorrowNftsQuery'
import { CartState, useCartState } from './useCartState'

export type TableNftData = NftWithLoanValue & {
  mint: string
  selected: boolean
  interest: number //? 1 week interest
}
type UseBorrowTableProps = {
  marketPubkey: string
  goToRequestLoanTab: () => void
}
export const useBorrowTable = ({ marketPubkey, goToRequestLoanTab }: UseBorrowTableProps) => {
  const { nfts, maxLoanValueOnMarket, isLoading } = useBorrowNftsQuery(marketPubkey)
  const navigate = useNavigate()
  const { tokenType } = useTokenType()
  const { viewState } = useTableView()

  const { borrowSingle } = useBorrowNftTransactions(marketPubkey)

  const {
    addNfts,
    findBestAvailableOffer,
    findOfferInCart,
    offerByMintInCart,
    availableOffers,
    addNft,
    removeNft,
    resetCart,
  } = useCartState()

  const [loanValuePercent, setLoanValuePercent] = useState(100)

  const tableNftsData: TableNftData[] = useMemo(() => {
    const tableNftsData = createTableNftData({
      nfts,
      findBestAvailableOffer,
      offerByMintInCart,
      maxBorrowPercent: loanValuePercent,
      maxLoanValueOnMarket,
    })

    return chain(tableNftsData)
      .orderBy((nft) => nft.loanValue, 'desc')
      .orderBy((nft) => nft.selected, 'desc')
      .value()
  }, [nfts, findBestAvailableOffer, offerByMintInCart, maxLoanValueOnMarket, loanValuePercent])

  const goToLoansPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.LOANS, AssetMode.NFT, tokenType))
  }

  const onNftSelect = useCallback(
    (nft: TableNftData) => {
      const isInCart = !!findOfferInCart({ mint: nft.mint })

      if (isInCart) {
        return removeNft({ mint: nft.mint })
      }

      const bestPrice = findBestAvailableOffer()?.loanValue || 0
      if (bestPrice) {
        addNft({ mint: nft.mint })
      }
    },
    [addNft, findBestAvailableOffer, findOfferInCart, removeNft],
  )

  const nftsInCart: TableNftData[] = useMemo(() => {
    const mints = Object.keys(offerByMintInCart)
    return tableNftsData.filter(({ mint }) => mints.includes(mint))
  }, [offerByMintInCart, tableNftsData])

  const onSelectNftsAmount = useCallback(
    (amount = 0) => {
      const mints = tableNftsData.map(({ mint }) => mint).slice(0, amount)

      addNfts({ mints })
    },
    [addNfts, tableNftsData],
  )

  const maxNftsToBorrow = useMemo(() => {
    const nftsNotInCart = tableNftsData.length - nftsInCart.length

    const availableNftsToBorrowNotInCart = Math.min(nftsNotInCart, availableOffers.length || 0)
    const availableNftsToBorrowInCart = Object.keys(offerByMintInCart).length

    return availableNftsToBorrowNotInCart + availableNftsToBorrowInCart
  }, [tableNftsData.length, nftsInCart.length, availableOffers.length, offerByMintInCart])

  const onSelectAll = useCallback(() => {
    if (isEmpty(offerByMintInCart)) {
      onSelectNftsAmount(maxNftsToBorrow)
    } else {
      resetCart()
    }
  }, [offerByMintInCart, onSelectNftsAmount, maxNftsToBorrow, resetCart])

  const columns = getTableColumns({
    onNftSelect,
    onBorrow: (nft: TableNftData) => borrowSingle(nft),
    isCardView: viewState === ViewState.CARD,
    findOfferInCart,
    goToRequestLoanTab,
    tokenType,
    cartNotEmpty: !isEmpty(offerByMintInCart),
    onSelectAll,
  })

  return {
    isLoading,
    tableNftsData,
    columns,
    onNftSelect,
    nftsInCart,
    goToLoansPage,
    maxNftsToBorrow,
    loanValuePercent,
    setLoanValuePercent,
    onSelectNftsAmount,
  }
}

type CalcAdjustedLoanValueByMaxByMarket = (props: {
  loanValue: number
  maxLoanValueOnMarket: number
  maxBorrowPercent: number
}) => number
const calcAdjustedLoanValueByMaxByMarket: CalcAdjustedLoanValueByMaxByMarket = ({
  loanValue,
  maxLoanValueOnMarket,
  maxBorrowPercent,
}) => {
  return Math.min(loanValue, maxLoanValueOnMarket * (maxBorrowPercent / 100))
}

const createTableNftData = ({
  nfts,
  offerByMintInCart,
  findBestAvailableOffer,
  maxLoanValueOnMarket,
  maxBorrowPercent,
}: {
  nfts: core.BorrowNft[]
  offerByMintInCart: CartState['offerByMintInCart']
  findBestAvailableOffer: CartState['findBestAvailableOffer']
  maxLoanValueOnMarket: number
  maxBorrowPercent: number
}) => {
  return nfts.map((nft) => {
    const offer = offerByMintInCart[nft.mint] ?? null

    const maxloanValue = offer?.loanValue || findBestAvailableOffer()?.loanValue || 0

    const loanValue = calcAdjustedLoanValueByMaxByMarket({
      loanValue: maxloanValue,
      maxLoanValueOnMarket,
      maxBorrowPercent,
    })

    const selected = !!offer

    const interest = calculateInterestOnBorrow({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue: loanValue,
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}

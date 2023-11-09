import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION, EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { isLoanAbleToClaim, isLoanAbleToTerminate } from '../helpers'
import { useLenderLoansAndOffers } from './useLenderLoansAndOffers'
import { useSortedLenderLoans } from './useSortedOffers'

import styles from '../ActiveOffersTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  taken: number
}

export const useActiveOffersTable = () => {
  const { loans, loading, offers, optimisticOffers, updateOrAddLoan, updateOrAddOffer, addMints } =
    useLenderLoansAndOffers()

  const { connected } = useWallet()
  const navigate = useNavigate()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const taken = sumBy(groupedLoan, (nft) => nft.fraktBond.currentPerpetualBorrowed)

      return { collectionName, collectionImage, taken }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'taken',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Taken'],
    onChange: setSelectedOptions,
    className: styles.searchSelect,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  const filteredLoans = useMemo(() => {
    if (selectedOptions.length) {
      return filter(loans, ({ nft }) => includes(selectedOptions, nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedOptions])

  const sortedLoans = useSortedLenderLoans(filteredLoans, sortOption.value)

  const showEmptyList = (!loans?.length && !loading) || !connected

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const { loansToClaim, loansToTerminate } = useMemo(() => {
    if (!loans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim = loans.filter(isLoanAbleToClaim)

    const loansToTerminate = loans.filter((loan) =>
      isLoanAbleToTerminate({ loan, offers, optimisticOffers }),
    )

    return { loansToClaim, loansToTerminate }
  }, [loans, offers, optimisticOffers])

  return {
    loans: sortedLoans,
    loading,
    showEmptyList,
    emptyListParams,
    updateOrAddLoan,
    updateOrAddOffer,
    addMints,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
    offers,
    loansToClaim,
    loansToTerminate,
  }
}

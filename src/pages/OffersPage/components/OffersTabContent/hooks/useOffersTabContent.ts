import { useMemo, useState } from 'react'

import { groupBy, sumBy, uniqBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { formatDecimal } from '@banx/utils'

import { isLoanAbleToClaim, isLoanAbleToTerminate } from '../components/ActiveLoansTable/helpers'
import { calculateClaimValue } from '../components/OfferCard/helpers'
import { useSortedData } from './useSortedOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersTabContent = () => {
  const {
    data,
    optimisticOffers,
    loading: isLoading,
    addMints,
    updateOrAddLoan,
    updateOrAddOffer,
  } = useLenderLoansAndOffers()

  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const filteredData = useMemo(() => {
    if (selectedOffers.length) {
      return data.filter(({ collectionMeta }) =>
        selectedOffers.includes(collectionMeta.collectionName),
      )
    }
    return data
  }, [data, selectedOffers])

  const { sortedData, sortParams } = useSortedData(filteredData)

  const searchSelectOptions = uniqBy(
    data.map(({ loans, collectionMeta }) => ({
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: sumBy(loans, calculateClaimValue),
    })),
    ({ collectionName }) => collectionName,
  )

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions: selectedOffers,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'claim',
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
      },
    },
    onChange: setSelectedOffers,
  }

  const { loansToClaim, loansToTerminate } = useMemo(() => {
    const flatLoans = data.flatMap(({ loans }) => loans)
    const groupedOffers = groupBy(data?.flatMap(({ offer }) => offer), 'publicKey') ?? {}

    if (!flatLoans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim = flatLoans.filter(isLoanAbleToClaim)

    const loansToTerminate = flatLoans.filter((loan) =>
      isLoanAbleToTerminate({ loan, offers: groupedOffers, optimisticOffers }),
    )

    return { loansToClaim, loansToTerminate }
  }, [data, optimisticOffers])

  const showEmptyList = !isLoading && !data.length

  return {
    data: sortedData,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    loansToClaim,
    loansToTerminate,
    addMints,
    updateOrAddLoan,
    updateOrAddOffer,
    offers: data?.flatMap(({ offer }) => offer),
  }
}

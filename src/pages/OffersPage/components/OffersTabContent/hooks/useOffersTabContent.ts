import { useMemo, useState } from 'react'

import { sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import { isLoanAbleToClaim, isLoanAbleToTerminate } from '../components/ActiveOffersTable/helpers'
import { caclulateClaimValue } from '../components/OfferCard/helpers'
import { useLenderLoansAndOffers } from './useLenderLoansAndOffers'
import { useSortedData } from './useSortedOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersTabContent = () => {
  const {
    data,
    offers,
    optimisticOffers,
    loading: isLoading,
    addMints,
    updateOrAddLoan,
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

  const searchSelectOptions = data.map(({ loans, collectionMeta }) => {
    return {
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: sumBy(loans, caclulateClaimValue),
    }
  })

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
    const flatLoans = data.flatMap((item) => item.loans)

    if (!flatLoans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim = flatLoans.filter(isLoanAbleToClaim)

    const loansToTerminate = flatLoans.filter((loan) =>
      isLoanAbleToTerminate({ loan, offers, optimisticOffers }),
    )

    return { loansToClaim, loansToTerminate }
  }, [data, offers, optimisticOffers])

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
  }
}

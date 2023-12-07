import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { chain, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { formatDecimal, isOfferClosed } from '@banx/utils'

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
    offers,
    loading: isLoading,
    addMints,
    updateOrAddLoan,
    updateOrAddOffer,
  } = useLenderLoansAndOffers()

  const { publicKey } = useWallet()

  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const filteredData = useMemo(() => {
    if (selectedOffers.length) {
      return data.filter(({ collectionMeta }) =>
        selectedOffers.includes(collectionMeta.collectionName),
      )
    }
    return data.filter(({ offer }) => !isOfferClosed(offer?.pairState))
  }, [data, selectedOffers])

  const { sortedData, sortParams } = useSortedData(filteredData)

  const searchSelectOptions = chain(data)
    .map(({ loans, collectionMeta }) => ({
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: sumBy(loans, calculateClaimValue),
    }))
    .uniqBy(({ collectionName }) => collectionName)
    .value()

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

    if (!flatLoans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim = flatLoans.filter(isLoanAbleToClaim)

    const loansToTerminate = flatLoans.filter((loan) =>
      isLoanAbleToTerminate({ loan, offers, walletPubkey: publicKey?.toBase58() || '' }),
    )

    return { loansToClaim, loansToTerminate }
  }, [data, offers, publicKey])

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
    offers,
  }
}

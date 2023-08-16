import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/loans'
import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'

import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../LoansActiveTable.module.less'

export type SearchSelectOption = {
  collectionName: string
  collectionImage: string
}

export const useLoansActiveTab = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { loans, isLoading } = useWalletLoans(publicKeyString)

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const filteredLoans = useFilteredLoans(loans, selectedOptions)
  const sortedLoans = useSortedLoans(filteredLoans, sortOption.value)

  const searchSelectParams = {
    onChange: setSelectedOptions,
    options: summarizeCollectionLoans(loans),
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collections', 'Nfts'],
    className: styles.searchSelect,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,
    sortViewParams: {
      searchSelectParams,
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}

const summarizeCollectionLoans = (loans: Loan[]) => {
  const loansGroupedByCollection = groupBy(loans, (loan) => loan.nft.meta.collectionName)

  return map(loansGroupedByCollection, (groupedLoan) => {
    const firstLoanInGroup = first(groupedLoan)
    const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
    const numberOfNFTs = groupedLoan.length

    return {
      collectionName,
      collectionImage,
      numberOfNFTs,
    }
  })
}

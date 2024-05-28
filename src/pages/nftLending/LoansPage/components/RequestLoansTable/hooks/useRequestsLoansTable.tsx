import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, isEmpty, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { core } from '@banx/api/nft'
import { BorrowTabName, useBorrowTabs } from '@banx/pages/nftLending/BorrowPage'
import { REQUEST_LOANS_TABLE_MESSAGES } from '@banx/pages/nftLending/LoansPage/constants'
import { PATHS } from '@banx/router'
import { createGlobalState, createPathWithParams } from '@banx/store'
import { ModeType } from '@banx/store/common'
import { useTokenType } from '@banx/store/nft'

import { useSortedLoans } from './useSortedLoans'

import styles from '../RequestLoansTable.module.less'

interface UseLoansActiveTableProps {
  loans: core.Loan[]
  isLoading: boolean
}

const useCollectionsStore = createGlobalState<string[]>([])

export const useRequestsLoansTable = ({ loans, isLoading }: UseLoansActiveTableProps) => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const { setTab: setBorrowTab } = useBorrowTabs()

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ nft }) => selectedCollections.includes(nft.meta.collectionName))
  }, [loans, selectedCollections])

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoansBySelectedCollections)

  const searchSelectParams = createSearchSelectParams({
    loans: filteredLoansBySelectedCollections,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = (isEmpty(loans) && !isLoading) || !connected
  const showSummary = !isEmpty(loans) && !isLoading

  const goToBorrowPage = () => {
    setBorrowTab(BorrowTabName.REQUEST)
    navigate(createPathWithParams(PATHS.BORROW, ModeType.NFT, tokenType))
  }

  const emptyListParams = {
    message: REQUEST_LOANS_TABLE_MESSAGES[connected ? 'connected' : 'notConnected'],
    buttonProps: connected ? { text: 'List loan request', onClick: goToBorrowPage } : undefined,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,

    showSummary,
    showEmptyList,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}

type CreateSearchSelectProps = {
  loans: core.Loan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
    const numberOfNFTs = groupedLoans.length

    return { collectionName, collectionImage, numberOfNFTs }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collection', 'Nfts'],
    className: styles.searchSelect,
  }

  return searchSelectParams
}

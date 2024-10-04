import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { TokenLoan } from '@banx/api/tokens'

import CollateralLoansCard from './components/CollateralLoansCard'
import { FilterSection } from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import { useTokenLoansContent } from './hooks/useTokenLoansContent'

import styles from './TokenLoansContent.module.less'

interface TokenLoansContentProps {
  loans: TokenLoan[]
  isLoading: boolean
}

const TokenLoansContent: FC<TokenLoansContentProps> = ({ loans, isLoading }) => {
  const { connected } = useWallet()

  const {
    loansPreviews,
    expandedCollateralMint,
    handleCardToggle,
    emptyListParams,
    searchSelectParams,
    sortParams,
  } = useTokenLoansContent(loans)

  const noData = !loansPreviews.length && !isLoading
  const showEmptyList = noData || !connected

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      <HeaderList />

      {isLoading && <Loader />}

      {!isLoading && (
        <div className={styles.cardsList}>
          {loansPreviews.map((preview) => (
            <CollateralLoansCard
              key={preview.collateralMint}
              loansPreview={preview}
              onClick={() => handleCardToggle(preview.collateralMint)}
              isExpanded={expandedCollateralMint === preview.collateralMint}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TokenLoansContent

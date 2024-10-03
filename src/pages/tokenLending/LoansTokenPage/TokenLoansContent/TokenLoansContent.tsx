import { FC, useMemo, useState } from 'react'

import { Loader } from '@banx/components/Loader'

import { TokenLoan } from '@banx/api/tokens'

import { buildLoansPreviewGroupedByMint } from '../helpers'
import CollateralLoansCard from './components/CollateralLoansCard'
import { HeaderList } from './components/HeaderList'

import styles from './TokenLoansContent.module.less'

interface TokenLoansContentProps {
  loans: TokenLoan[]
  isLoading: boolean
}

const TokenLoansContent: FC<TokenLoansContentProps> = ({ loans, isLoading }) => {
  const loansPreviews = useMemo(() => buildLoansPreviewGroupedByMint(loans), [loans])

  const [expandedCollateralMint, setExpandedCollateralMint] = useState('')

  const handleCardToggle = (mint: string) => {
    setExpandedCollateralMint((prevMint) => (prevMint === mint ? '' : mint))
  }

  return (
    <div className={styles.content}>
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

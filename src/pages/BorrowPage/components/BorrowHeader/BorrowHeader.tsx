import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useBorrowNftsAndSimpleOffers } from '../../hooks'

const Header = () => {
  const { nfts, isLoading } = useBorrowNftsAndSimpleOffers()

  const maxBorrow = 333.33 //TODO: calc maxBorrow here or get from BE

  const nftsAmount = nfts.length

  return (
    <PageHeaderBackdrop title="Borrow SOL">
      {!isLoading && (
        <>
          <AdditionalStat label="Your NFTs" value={nftsAmount} valueType={VALUES_TYPES.STRING} />
          <SeparateStatsLine />
          <MainStat label="Max borrow" value={`${maxBorrow}◎`} />
        </>
      )}
    </PageHeaderBackdrop>
  )
}

export default Header

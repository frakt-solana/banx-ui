import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useBorrowNfts } from '../../hooks'

const Header = () => {
  const { nfts, isLoading, maxBorrow } = useBorrowNfts()

  const nftsAmount = nfts.length

  return (
    <PageHeaderBackdrop title="Borrow SOL">
      {!isLoading && (
        <>
          <AdditionalStat label="Your NFTs" value={nftsAmount} valueType={VALUES_TYPES.STRING} />
          <AdditionalStat label="Duration" value="Perpetual, 72h" valueType={VALUES_TYPES.STRING} />
          <SeparateStatsLine />
          <MainStat label="Max borrow" value={`${(maxBorrow / 1e9).toFixed(2)}◎`} />
        </>
      )}
    </PageHeaderBackdrop>
  )
}

export default Header

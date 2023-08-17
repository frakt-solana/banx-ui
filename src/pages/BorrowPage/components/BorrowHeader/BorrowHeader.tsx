import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

const Header = () => {
  return (
    <PageHeaderBackdrop title="Borrow SOL">
      <AdditionalStat label="Your NFTs" value={25} valueType={VALUES_TYPES.STRING} />
      <SeparateStatsLine />
      <MainStat label="Max borrow" value="128.5◎" />
    </PageHeaderBackdrop>
  )
}

export default Header

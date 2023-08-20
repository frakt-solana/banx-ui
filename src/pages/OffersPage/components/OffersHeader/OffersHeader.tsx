import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'

// import styles from './OffersHeader.module.less'

const OffersHeader = () => {
  return (
    <PageHeaderBackdrop title="My offers">
      <AdditionalStat label="Loans volume" value={145.5} />
      <AdditionalStat label="Offers volume" value={145.5} />
      <AdditionalStat label="Exp. interest" value={145.5} />
      <SeparateStatsLine />
      <MainStat label="Earned" value={120.12} />
    </PageHeaderBackdrop>
  )
}

export default OffersHeader

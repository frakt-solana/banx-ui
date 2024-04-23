import { useMixpanelLocationTrack } from '@banx/utils'

import PlaceOffersContent from './PlaceOffersContent'
import LendHeader from './PlaceOffersContent/components/LendHeader'

import styles from './LendPage.module.less'

export const LendPage = () => {
  useMixpanelLocationTrack('lend')

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <PlaceOffersContent />
    </div>
  )
}

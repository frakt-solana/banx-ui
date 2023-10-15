import { useMixpanelLocationTrack } from '@banx/utils'

import LendHeader from './components/LendHeader'
import LendPageContent from './components/LendPageContent'

export const LendPage = () => {
  useMixpanelLocationTrack('lend')

  return (
    <>
      <LendHeader />
      <LendPageContent />
    </>
  )
}

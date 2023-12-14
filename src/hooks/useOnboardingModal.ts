import { useEffect } from 'react'

import { OnboardingModal, OnboardingModalContentType } from '@banx/components/modals'

import { useModal } from '@banx/store'

import { useLocalStorage } from './useLocalStorage'

const ONBOARDING_VIEW_STATE_DEFAULT_VALUE = {
  [OnboardingModalContentType.DASHBOARD]: false,
  [OnboardingModalContentType.BORROW]: false,
  [OnboardingModalContentType.LEND]: false,
  [OnboardingModalContentType.REFINANCE]: false,
}

export const useOnboardingModal = (contentType: `${OnboardingModalContentType}`) => {
  const { open, close } = useModal()

  const [onboardingViewedState, setOnboardingViewedState] = useLocalStorage<{
    [key: string]: boolean
  }>('@banx.onboardingViewed', ONBOARDING_VIEW_STATE_DEFAULT_VALUE)

  useEffect(() => {
    if (!onboardingViewedState[contentType]) {
      open(OnboardingModal, {
        contentType,
        onCancel: () => {
          setOnboardingViewedState((prevState) => ({
            ...prevState,
            [contentType]: true,
          }))
          close()
        },
      })
    }
  }, [open, close, contentType, setOnboardingViewedState, onboardingViewedState])
}

import { useEffect } from 'react'

import { chain } from 'lodash'

import { OnboardingModal, OnboardingModalContentType } from '@banx/components/modals'

import { useModal } from '@banx/store'

import { useLocalStorage } from './useLocalStorage'

const ONBOARDING_VIEW_STATE_DEFAULT_VALUE = chain(OnboardingModalContentType)
  .values()
  .map((value) => [value, false])
  .fromPairs()
  .value()

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

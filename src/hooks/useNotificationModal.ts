import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { NotificationModal } from '@banx/components/NotificationModal'

import { fetchModalNotification } from '@banx/api/common'
import { useModal } from '@banx/store'

import { useLocalStorage } from './useLocalStorage'

export const useNotificationModal = () => {
  const { open, close } = useModal()

  //? Store in localstorage prev notification
  const [prevModalHtmlContent, setPrevModalHtmlContent] = useLocalStorage<string | null>(
    '@banx.modalHtmlContent',
    null,
  )

  const { data: modalHtmlContent } = useQuery(['modalNotification'], fetchModalNotification, {
    staleTime: 30 * 60 * 1000, // 30 mins
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!modalHtmlContent) {
      return
    }

    if (modalHtmlContent === prevModalHtmlContent) {
      return
    }

    open(NotificationModal, {
      htmlContent: modalHtmlContent,
      onCancel: () => {
        setPrevModalHtmlContent(modalHtmlContent ?? null)
        close()
      },
    })
  }, [close, modalHtmlContent, open, prevModalHtmlContent, setPrevModalHtmlContent])
}

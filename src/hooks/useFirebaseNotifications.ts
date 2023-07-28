import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { web3 } from 'fbonds-core'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

import { BACKEND_DOMAIN, FCM } from '@frakt/constants'

const firebaseConfig = {
  apiKey: FCM.API_KEY,
  authDomain: FCM.AUTH_DOMAIN,
  databaseURL: FCM.DATABASE_URL,
  projectId: FCM.PROJECT_ID,
  storageBucket: FCM.STORAGE_BUCKET,
  messagingSenderId: FCM.MESSSAGING_SENDER_ID,
  appId: FCM.APP_ID,
  measurementId: FCM.MEASUREMENT_ID,
}

const getFirebaseToken = async (): Promise<string> => {
  try {
    const app = initializeApp(firebaseConfig)
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: FCM.VAPID })
    return token
  } catch (error) {
    console.error('Error getting Firebase token:', error)
    return ''
  }
}

const sendFirebaseTokenToBackend = async (token: string, publicKey: web3.PublicKey) => {
  try {
    await axios.post(`https://${BACKEND_DOMAIN}/web`, {
      token,
      user: publicKey?.toBase58(),
      type: 'all',
    })
  } catch (error) {
    console.error('Error sending token to backend:', error)
  }
}

const registerServiceWorker = async (): Promise<void> => {
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  } catch (error) {
    console.error('Error registering service worker:', error)
  }
}

export const useFirebaseNotifications = (): void => {
  const { publicKey } = useWallet()

  useEffect(() => {
    ;(async () => {
      if (publicKey && 'serviceWorker' in navigator) {
        try {
          const token = await getFirebaseToken()
          if (token) {
            await sendFirebaseTokenToBackend(token, publicKey)
          }
          registerServiceWorker()
        } catch (error) {
          console.error('Error handling Firebase token:', error)
        }
      }
    })()
  }, [publicKey])
}

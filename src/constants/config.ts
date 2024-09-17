import {
  PROTOCOL_FEE,
  PROTOCOL_FEE_TOKEN,
  REPAY_FEE_APR,
} from 'fbonds-core/lib/fbond-protocol/constants'

export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'

export const BACKEND_BASE_URL = 'https://api.banx.gg'

export const FCM = {
  AUTH_DOMAIN: 'frakt-ee9cc.firebaseapp.com',
  DATABASE_URL: 'https://frakt-ee9cc-default-rtdb.firebaseio.com/',
  PROJECT_ID: 'frakt-ee9cc',
  STORAGE_BUCKET: 'frakt-ee9cc.appspot.com',
  MESSSAGING_SENDER_ID: '656060454310',
  APP_ID: '1:656060454310:web:4fdd44c2473a3ed82ceb67',
  MEASUREMENT_ID: 'G-R9Z12HEVHX',
  VAPID: 'BA3dBalaUt9WVL3Jy1btckV3leodIdI9MAc5x_SAysfZdlCWMXf6AYmHN938axmgVvJOeTlA--x7Cacd1J2wBQ0',
  API_KEY: 'AIzaSyDdZbDnjh0HjRlACSm0pDGqhP8aWbzOLkM',
}

export const DISCORD = {
  CLIENT_ID: '983383827235872799',
  SERVER_URL: 'https://discord.com/invite/UqbxgFrvCu',
}

export const SENTRY = {
  APP_DSN: 'https://cdf6f9ff65c94908b53c1dc8f071632e@o1288412.ingest.sentry.io/4505602108096512',
}

export const BONDS = {
  PROGRAM_PUBKEY: '4tdmkuY6EStxbS6Y8s5ueznL3VPMSugrvQuDeAHGZhSt',
  ADMIN_PUBKEY: 'revJ8QJgQ3xCcZ6CMykjsmGMYdg8Pj9WnqgJZBHBwSK',
  PROTOCOL_FEE: PROTOCOL_FEE, //? Base points
  REPAY_FEE_APR: REPAY_FEE_APR, //? Base points
  PROTOCOL_FEE_TOKEN: PROTOCOL_FEE_TOKEN, //? Base points
}

export const DIALECT = {
  APP_PUBLIC_KEY: '3BX6ZCuydU7Mtf5AxTvCVKLV2UJi5Mmpw5dty2Twq34X',
}

export const BANX_STAKING = {
  WHITELIST_ENTRY_PUBKEY: '6GBJtSCQBRTwU9XmH3gxsfUvvGE9QBMrMTvB4kcEGiya',
  HADO_REGISTRY_PUBKEY: 'ALZCGCWi7rv1oyJiLmdcpUExMqiHdREURLjM698n5gZD',
  FRAKT_MARKET: 'HrsMreAqj4ss19WDemwFCVnxnhgJ5tTNjt4k8cKzTmko',
}

export const IS_PRIVATE_MARKETS = process.env.IS_PRIVATE_MARKETS === 'true'

export const DYNAMIC_APR = true

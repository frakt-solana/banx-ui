import { BN, web3 } from 'fbonds-core'

export interface SimpleOffer {
  id: string
  publicKey: web3.PublicKey
  loanValue: BN
  hadoMarket: web3.PublicKey
}

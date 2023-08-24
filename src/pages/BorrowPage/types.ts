export interface SimpleOffer {
  id: string
  publicKey: string
  loanValue: number
  hadoMarket: string
}

export type SimpleOffersByMarket = Record<string, SimpleOffer[]>

export type MintsByMarket = Record<string, string[]>

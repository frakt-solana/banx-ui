interface Rewards {
  user: string
  reward: number
}

export interface UserRewards {
  lenders: Rewards[]
  borrowers: Rewards[]
}

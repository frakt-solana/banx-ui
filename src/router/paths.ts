const NFT_ROUTES = {
  BORROW: '/borrow',
  LEND: '/lend',
  LOANS: '/loans',
  OFFERS: '/offers',
}

const TOKEN_ROUTES = {
  BORROW_TOKEN: '/borrowToken',
  LEND_TOKEN: '/lendToken',
  LOANS_TOKEN: '/loansToken',
  OFFERS_TOKEN: '/offersToken',
}

export const PATHS = {
  ROOT: '/',
  PAGE_404: '/404',

  DASHBOARD: '/dashboard',
  ADVENTURES: '/adventures',
  LEADERBOARD: '/leaderboard',

  ...NFT_ROUTES,
  ...TOKEN_ROUTES,
}

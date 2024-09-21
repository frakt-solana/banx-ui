import { FC } from 'react'

import { AdventuresPage, DashboardPage, LeaderboardPage, RootPage } from '@banx/pages/common'
import { BorrowPage, LendPage, LoansPage, OffersPage } from '@banx/pages/nftLending'
import {
  BorrowTokenPage,
  LendTokenPage,
  LoansTokenPage,
  OffersTokenPage,
} from '@banx/pages/tokenLending'

import { PATHS } from './paths'

interface Route {
  path: string
  component: FC
}

const nftRoutes: Route[] = [
  {
    path: PATHS.BORROW,
    component: BorrowPage,
  },
  {
    path: PATHS.LOANS,
    component: LoansPage,
  },
  {
    path: PATHS.LEND,
    component: LendPage,
  },
  {
    path: PATHS.OFFERS,
    component: OffersPage,
  },
]

const tokenRoutes: Route[] = [
  {
    path: PATHS.BORROW_TOKEN,
    component: BorrowTokenPage,
  },
  {
    path: PATHS.LOANS_TOKEN,
    component: LoansTokenPage,
  },
  {
    path: PATHS.LEND_TOKEN,
    component: LendTokenPage,
  },
  {
    path: PATHS.OFFERS_TOKEN,
    component: OffersTokenPage,
  },
]

export const routes: Route[] = [
  {
    path: PATHS.ROOT,
    component: RootPage,
  },
  {
    path: PATHS.DASHBOARD,
    component: DashboardPage,
  },
  {
    path: PATHS.ADVENTURES,
    component: AdventuresPage,
  },
  {
    path: PATHS.LEADERBOARD,
    component: LeaderboardPage,
  },
  {
    path: PATHS.PAGE_404, //? Why don't we have page 404?
    component: RootPage,
  },

  ...nftRoutes,
  ...tokenRoutes,

  {
    path: '*',
    component: RootPage,
  },
]

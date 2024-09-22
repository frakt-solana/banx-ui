import { ComponentType, FC, useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

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
    path: PATHS.BORROW,
    component: () => (
      <ModeBasedComponent nftComponent={BorrowPage} tokenComponent={BorrowTokenPage} />
    ),
  },
  {
    path: PATHS.LEND,
    component: () => <ModeBasedComponent nftComponent={LendPage} tokenComponent={LendTokenPage} />,
  },
  {
    path: PATHS.LOANS,
    component: () => (
      <ModeBasedComponent nftComponent={LoansPage} tokenComponent={LoansTokenPage} />
    ),
  },
  {
    path: PATHS.OFFERS,
    component: () => (
      <ModeBasedComponent nftComponent={OffersPage} tokenComponent={OffersTokenPage} />
    ),
  },
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

interface ModeBasedComponentProps {
  nftComponent: ComponentType
  tokenComponent: ComponentType
}

const ModeBasedComponent: FC<ModeBasedComponentProps> = ({
  nftComponent: NftComponent,
  tokenComponent: TokenComponent,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const asset = params.get('asset')

  useEffect(() => {
    if (!asset) {
      navigate(`${location.pathname}?asset=nft`, { replace: true })
    }
  }, [asset, location.pathname, navigate])

  if (asset === 'token') {
    return <TokenComponent />
  }

  return <NftComponent />
}

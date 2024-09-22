import { ComponentType, FC } from 'react'

import { useLocation } from 'react-router-dom'

import { AdventuresPage, DashboardPage, LeaderboardPage, RootPage } from '@banx/pages/common'
import { BorrowPage, LendPage, LoansPage, OffersPage } from '@banx/pages/nftLending'
import {
  BorrowTokenPage,
  LendTokenPage,
  LoansTokenPage,
  OffersTokenPage,
} from '@banx/pages/tokenLending'
import { getAssetModeFromUrl } from '@banx/store'
import { AssetMode } from '@banx/store/common'

import { PATHS } from './paths'

interface Route {
  path: string
  component: FC
}

export const routes: Route[] = [
  {
    path: PATHS.BORROW,
    component: () => <AssetModeComponent nftView={BorrowPage} tokenView={BorrowTokenPage} />,
  },
  {
    path: PATHS.LOANS,
    component: () => <AssetModeComponent nftView={LoansPage} tokenView={LoansTokenPage} />,
  },
  {
    path: PATHS.LEND,
    component: () => <AssetModeComponent nftView={LendPage} tokenView={LendTokenPage} />,
  },

  {
    path: PATHS.OFFERS,
    component: () => <AssetModeComponent nftView={OffersPage} tokenView={OffersTokenPage} />,
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
  {
    path: '*',
    component: RootPage,
  },
]

interface AssetModeComponentProps {
  nftView: ComponentType
  tokenView: ComponentType
}

const AssetModeComponent: FC<AssetModeComponentProps> = ({
  nftView: NftView,
  tokenView: TokenView,
}) => {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const assetMode = getAssetModeFromUrl(urlParams)

  return assetMode === AssetMode.Token ? <TokenView /> : <NftView />
}

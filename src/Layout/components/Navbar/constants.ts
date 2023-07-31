import { PATHS } from '@frakt/constants'
import { Borrow, BorrowDark, Dashboard, DashboardDark, Lend, LendDark } from '@frakt/icons'

export const NAVIGATION_LINKS = [
  {
    pathname: PATHS.ROOT,
    to: PATHS.ROOT,
    label: 'Dashboard',
    icon: Dashboard,
    iconDark: DashboardDark,
    primary: true,
  },
  {
    pathname: PATHS.BORROW_ROOT,
    to: PATHS.BORROW_LITE,
    label: 'Borrow',
    icon: Borrow,
    iconDark: BorrowDark,
    primary: true,
  },
  {
    pathname: PATHS.LOANS,
    to: PATHS.LOANS,
    label: 'My loans',
  },
  {
    pathname: PATHS.BONDS_LITE,
    to: PATHS.BONDS_LITE,
    label: 'Lend',
    icon: Lend,
    iconDark: LendDark,
    primary: true,
  },
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    pathname: PATHS.ADVENTURES,
    to: PATHS.ADVENTURES,
    label: 'Banx',
    // icon: BanxFilled,
    // iconDark: BanxFilledDark,
  },
  {
    pathname: PATHS.LIQUIDATIONS,
    to: PATHS.LIQUIDATIONS,
    label: 'Raffles',
    // icon: Raffles,
    // iconDark: RafflesDark,
  },
  {
    pathname: PATHS.AUCTIONS,
    to: PATHS.AUCTIONS,
    label: 'Auctions',
    // icon: Auction,
    // iconDark: AuctionDark,
  },
]

import { DISCORD, DOCS_URL, GITHUB_URL, MEDIUM_URL, TWITTER_URL } from '@banx/constants'
import {
  Auction,
  AuctionDark,
  BanxFilled,
  BanxFilledDark,
  Borrow,
  BorrowDark,
  Dashboard,
  DashboardDark,
  Discord,
  DiscordDark,
  Docs,
  DocsDark,
  Github,
  GithubDark,
  Lend,
  LendDark,
  Medium,
  MediumDark,
  Raffles,
  RafflesDark,
  Twitter,
  TwitterDark,
} from '@banx/icons'
import { PATHS } from '@banx/router'

export const NAVIGATION_LINKS = [
  {
    pathname: PATHS.ROOT,
    label: 'Dashboard',
    primary: true,
    icons: {
      light: Dashboard,
      dark: DashboardDark,
    },
  },
  {
    pathname: PATHS.BORROW,
    label: 'Borrow',
    primary: true,
    icons: {
      light: Borrow,
      dark: BorrowDark,
    },
  },
  {
    pathname: PATHS.LOANS,
    label: 'My loans',
  },
  {
    pathname: PATHS.LEND,
    label: 'Lend',
    primary: true,
    icons: {
      light: Lend,
      dark: LendDark,
    },
  },
  {
    pathname: PATHS.OFFERS,
    label: 'My offers',
  },
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    pathname: PATHS.ADVENTURES,
    label: 'Banx',
    icons: {
      light: BanxFilled,
      dark: BanxFilledDark,
    },
  },
  {
    pathname: PATHS.LIQUIDATIONS,
    label: 'Raffles',
    icons: {
      light: Raffles,
      dark: RafflesDark,
    },
  },
  {
    pathname: PATHS.AUCTIONS,
    label: 'Auctions',
    icons: {
      light: Auction,
      dark: AuctionDark,
    },
  },
]

export const DOCUMENTATIONS_LINKS = [
  {
    label: 'Docs',
    href: DOCS_URL,
    icons: {
      light: Docs,
      dark: DocsDark,
    },
  },
  {
    label: 'Medium',
    href: MEDIUM_URL,
    icons: {
      light: Medium,
      dark: MediumDark,
    },
  },
  {
    label: 'GitHub',
    href: GITHUB_URL,
    icons: {
      light: Github,
      dark: GithubDark,
    },
  },
]

export const COMMUNITY_LINKS = [
  {
    label: 'Discord',
    href: DISCORD.SERVER_URL,
    icons: {
      light: Discord,
      dark: DiscordDark,
    },
  },
  {
    label: 'Twitter',
    href: TWITTER_URL,
    icons: {
      light: Twitter,
      dark: TwitterDark,
    },
  },
]

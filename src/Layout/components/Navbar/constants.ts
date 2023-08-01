import { DISCORD } from '@frakt/constants'
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
} from '@frakt/icons'
import { PATHS } from '@frakt/router'

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
    href: 'https://docs.frakt.xyz/frakt/',
    icons: {
      light: Docs,
      dark: DocsDark,
    },
  },
  {
    label: 'Medium',
    href: 'https://medium.com/@frakt_HQ',
    icons: {
      light: Medium,
      dark: MediumDark,
    },
  },
  {
    label: 'GitHub',
    href: 'https://github.com/frakt-solana',
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
    href: 'https://twitter.com/FRAKT_HQ',
    icons: {
      light: Twitter,
      dark: TwitterDark,
    },
  },
]

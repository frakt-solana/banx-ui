import moment, { Moment } from 'moment'

import { DAYS_IN_WEEK } from '@banx/constants'

const TUESDAY = 2
const MIDNIGHT_HOUR = 0
const MIDNIGHT_MINUTE = 0

export const calculateNextTuesdayAtUTC = (): Moment => {
  const now = moment.utc()

  const daysUntilNextTuesday = (TUESDAY + DAYS_IN_WEEK - now.day()) % DAYS_IN_WEEK

  const nextTuesday = moment(now)
    .add(daysUntilNextTuesday + (now.day() === TUESDAY ? DAYS_IN_WEEK : 0), 'days')
    .startOf('day')
    .hour(MIDNIGHT_HOUR)
    .minute(MIDNIGHT_MINUTE)

  return nextTuesday
}

export const isTuesdayAndMidnight = (now: Moment): boolean => {
  return now.day() === TUESDAY && now.hours() === MIDNIGHT_HOUR && now.minutes() === MIDNIGHT_MINUTE
}

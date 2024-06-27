import { chain, isInteger, padStart, split } from 'lodash'
import moment, { Duration } from 'moment'

export const calculateTimeFromNow = (seconds: number) => {
  return moment.unix(moment().unix() + seconds).toNow(true)
}

export const formatWithLeadingZero = (value: number): string => {
  if (value <= 0 || !isInteger(value)) return '00'
  return padStart(value.toString(), 2, '0')
}

export const getTimeDifference = (endTimeUnix: number): Duration => {
  const currentTimeMoment = moment()
  const endTimeMoment = moment.unix(endTimeUnix)

  return moment.duration(endTimeMoment.diff(currentTimeMoment))
}

export type CountdownUnits = {
  days: number
  hours: number
  minutes: number
  seconds: number
}
export const DEFAULT_COUNTDOWN_UNITS: CountdownUnits = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}
export const splitTimeDifferenceToUnits = (difference: Duration | null): CountdownUnits => {
  if (!difference) {
    return DEFAULT_COUNTDOWN_UNITS
  }
  const days = Math.trunc(difference.asDays())
  const hours = difference.hours()
  const minutes = difference.minutes()
  const seconds = difference.seconds()

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}
/**
 *
 * @param countdownUnits
 * @param format format string. Examples: 'd:h:m:s', 'h:m:s' etc.
 * @returns Countdown in string format: '05d:04h:24m:17s'
 */
export const formatCountdownUnits = (countdownUnits: CountdownUnits, format: string): string => {
  const unitsToShow = split(format, ':')
  //TODO: Add regular expression for better format validation
  if (unitsToShow.length === 0) throw new Error('Incorrect time format')

  const { days, hours, minutes, seconds } = countdownUnits

  return chain(unitsToShow)
    .map((unit) => {
      if (unit === 'd') return `${formatWithLeadingZero(days)}d`
      if (unit === 'h') return `${formatWithLeadingZero(hours)}h`
      if (unit === 'm') return `${formatWithLeadingZero(minutes)}m`
      return `${formatWithLeadingZero(seconds)}s`
    })
    .value()
    .join(' : ')
}

import { toDate } from './date'

export function sortAppointments(appointments) {
  return appointments.toSorted(
    (left, right) =>
      (toDate(left.date)?.getTime() ?? 0) - (toDate(right.date)?.getTime() ?? 0),
  )
}

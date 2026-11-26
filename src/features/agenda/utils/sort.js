import { toDate } from './date'

export function sortAppointments(appointments) {
  return appointments.toSorted(
    (left, right) =>
      (toDate(left.date)?.getTime() ?? 0) - (toDate(right.date)?.getTime() ?? 0),
  )
}

export function sortMonthAppointments(appointments, staffById) {
  return appointments.toSorted((left, right) => {
    const dateDifference =
      (toDate(left.date)?.getTime() ?? 0) - (toDate(right.date)?.getTime() ?? 0)
    if (dateDifference !== 0) return dateDifference

    const staffDifference = (staffById[left.tech_id]?.name ?? '').localeCompare(
      staffById[right.tech_id]?.name ?? '',
      'pt-PT',
    )
    return staffDifference || left.id.localeCompare(right.id)
  })
}

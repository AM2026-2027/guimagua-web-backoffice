const STATUS_CLASSES = {
  scheduled: 'border-primary/40 bg-white text-primary',
  in_progress: 'border-primary bg-primary text-white',
  completed: 'border-slate-300 bg-slate-100 text-slate-700',
  cancelled: 'border-slate-300 bg-background text-slate-500 line-through',
}

export function appointmentStatusClass(status) {
  return STATUS_CLASSES[status] ?? 'border-slate-300 bg-white text-slate-700'
}

export function countAppointmentStatuses(appointments) {
  const counts = {
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const appointment of appointments) {
    if (Object.prototype.hasOwnProperty.call(counts, appointment.status)) {
      counts[appointment.status] += 1
    }
  }

  return counts
}

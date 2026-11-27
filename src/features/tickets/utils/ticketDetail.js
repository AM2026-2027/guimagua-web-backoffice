const READING_METRICS = [
  {
    key: 'ph_level',
    label: 'pH',
    unit: '',
    minimum: 'ph_min',
    maximum: 'ph_max',
  },
  {
    key: 'chlorine_ppm',
    label: 'Cloro',
    unit: 'ppm',
    minimum: 'chlorine_min_ppm',
    maximum: 'chlorine_max_ppm',
  },
  {
    key: 'temperature_c',
    label: 'Temperatura',
    unit: '°C',
    minimum: 'temperature_min_c',
    maximum: 'temperature_max_c',
  },
]

export function getPoolReadingMetrics(reading, thresholds) {
  return READING_METRICS.map((metric) => {
    const value = reading?.[metric.key]
    const minimum = thresholds?.[metric.minimum]
    const maximum = thresholds?.[metric.maximum]
    const hasRange = Number.isFinite(minimum) && Number.isFinite(maximum)

    return {
      ...metric,
      value: Number.isFinite(value) ? value : null,
      state:
        !Number.isFinite(value) || !hasRange
          ? 'unknown'
          : value >= minimum && value <= maximum
            ? 'normal'
            : 'alert',
    }
  })
}

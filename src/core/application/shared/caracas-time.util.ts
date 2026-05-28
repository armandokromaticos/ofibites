// Cortes de día/mes para los dashboards en hora de Venezuela.
// America/Caracas es UTC-4 fijo (sin horario de verano desde 2016).
const CARACAS_OFFSET_MINUTES = -4 * 60;
const MS_PER_MINUTE = 60_000;

/** Devuelve "YYYY-MM-DD" del instante expresado en hora de Caracas. */
export function toCaracasDateKey(date: Date): string {
  const shifted = new Date(
    date.getTime() + CARACAS_OFFSET_MINUTES * MS_PER_MINUTE,
  );
  return shifted.toISOString().slice(0, 10);
}

/**
 * Rango [monthStart, monthEnd) del mes calendario actual en Caracas,
 * como instantes UTC listos para usar en filtros de Prisma.
 */
export function caracasMonthRange(now: Date = new Date()): {
  monthStart: Date;
  monthEnd: Date;
} {
  const shifted = new Date(
    now.getTime() + CARACAS_OFFSET_MINUTES * MS_PER_MINUTE,
  );
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  // Medianoche Caracas del día 1 = restar el offset al UTC de ese día 1.
  const monthStart = new Date(
    Date.UTC(year, month, 1) - CARACAS_OFFSET_MINUTES * MS_PER_MINUTE,
  );
  const monthEnd = new Date(
    Date.UTC(year, month + 1, 1) - CARACAS_OFFSET_MINUTES * MS_PER_MINUTE,
  );
  return { monthStart, monthEnd };
}

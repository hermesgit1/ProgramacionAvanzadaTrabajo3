// prq_ingreso_custom.js
// Class to compute custom fields for prq_ingreso_automoviles records:
// - durationMinutes: duration between fecha_hora_entrada and fecha_hora_salida in whole minutes
// - durationHours: duration in hours (decimal, 2 decimals)
// - amountToPay: total amount to pay based on pricePerHour (decimal, 2 decimals)
// If fecha_hora_salida is null, all computed fields return null.

class IngresoCustom {
  // billingMode: 'proportional' (default) or 'hourly_ceil' (round up to next hour)
  constructor(record, pricePerHour = null, billingMode = 'proportional') {
    // record expected to have fecha_hora_entrada and fecha_hora_salida (strings in 'YYYY-MM-DD HH:mm:ss' format or null)
    this.record = record || {};
    this.pricePerHour = pricePerHour; // number or null
    this.billingMode = billingMode;
  }

  // Helper to parse datetime string into Date. Returns Date or null.
  static parseDateTime(value) {
    if (!value) return null;
    // Replace space with 'T' to make ISO-ish for Date parsing (local timezone)
    // Append 'Z' if you want to force UTC — here we parse as local time.
    // Input format assumed: 'YYYY-MM-DD HH:mm:ss'
    const normalized = value.replace(' ', 'T');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  // Returns duration in whole minutes (integer) or null
  get durationMinutes() {
    const entrada = IngresoCustom.parseDateTime(this.record.fecha_hora_entrada);
    const salida = IngresoCustom.parseDateTime(this.record.fecha_hora_salida);
    if (!entrada || !salida) return null;
    const diffMs = salida.getTime() - entrada.getTime();
    if (diffMs < 0) return null; // invalid negative duration
    const minutes = Math.floor(diffMs / 60000);
    return minutes;
  }

  // Returns duration in hours as decimal (two decimals) or null
  get durationHours() {
    const mins = this.durationMinutes;
    if (mins === null) return null;
    const hours = mins / 60;
    return Number(hours.toFixed(2));
  }

  // Returns amount to pay based on pricePerHour (number). If pricePerHour is null returns null.
  // Billing modes:
  // - 'proportional' (default): bill proportional to the fractional hours (e.g., 1.5 h = 1.5 * price)
  // - 'hourly_ceil': bill by full hours, rounding up (e.g., 1.1 h => 2 hours)
  get amountToPay() {
    const hours = this.durationHours;
    if (hours === null) return null;
    if (this.pricePerHour == null) return null;
    let billableHours;
    if (this.billingMode === 'hourly_ceil') {
      billableHours = Math.ceil(hours);
    } else {
      // proportional
      billableHours = hours;
    }
    const amount = billableHours * Number(this.pricePerHour);
    return Number(amount.toFixed(2));
  }

  // Convenience: return an object with all computed fields
  get computed() {
    return {
      durationMinutes: this.durationMinutes,
      durationHours: this.durationHours,
      amountToPay: this.amountToPay
    };
  }
}

module.exports = IngresoCustom;

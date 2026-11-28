/** Quita la fecha historica del texto de dias sin modificar los datos recibidos. */
export function diasSinFecha(dias: string): string {
    return dias.replace(/\s*\b\d{1,2}[\/\\]\d{1,2}[\/\\]\d{4}\b/g, '').trim();
}

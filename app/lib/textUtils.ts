/**
 * Utility functions for text manipulation
 */

/**
 * Truncates text to a maximum length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Truncates stop names specifically for mobile display
 * Takes into account the available space before the "Acquista" button
 * @param stopName - The stop name to truncate
 * @returns Truncated stop name
 */
export function truncateStopName(stopName: string): string {
  // Based on the mobile layout, we have limited space before the "Acquista" button
  // With 14px font size, we limit to 20 characters to ensure no overlap
  const maxLength = 20;
  return truncateText(stopName, maxLength);
}

/**
 * Converts text from all uppercase to title case (first letter uppercase, rest lowercase)
 * @param text - The text to convert
 * @returns Text in title case
 */
function toTitleCase(text: string): string {
  if (!text) return text;
  // Se è tutto maiuscolo, converti a title case
  if (text === text.toUpperCase() && text !== text.toLowerCase()) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  return text;
}

/**
 * Normalizes stop names by removing "Piazza San Francesco" and its variants (same as Teramo)
 * Also converts all uppercase to title case
 * @param name - The stop name to normalize
 * @returns Normalized stop name
 */
export function normalizeStopName(name?: string): string {
  if (!name) return '';
  
  // Rimuovi "Piazza San Francesco" e tutte le sue varianti - è la stessa cosa di Teramo
  // Gestisce: "Piazza San Francesco", "PIAZZA S. FRANCESCO", "Piazza S. Francesco", "TERAMO-PIAZZA S. FRANCESCO", etc.
  let normalized = name
    .replace(/teramo\s*-\s*piazza\s+s\.?\s*francesco/gi, 'Teramo')
    .replace(/teramo\s*-\s*piazza\s+san\s+francesco/gi, 'Teramo')
    .replace(/piazza\s+s\.?\s*francesco/gi, '')
    .replace(/piazza\s+san\s+francesco/gi, '')
    .replace(/\s*-\s*piazza\s+s\.?\s*francesco/gi, '')
    .replace(/piazza\s+s\.?\s*francesco\s*-?\s*/gi, '')
    .trim();
  
  // Rimuovi eventuali trattini rimasti all'inizio o alla fine
  normalized = normalized.replace(/^-\s*|\s*-$/g, '').trim();
  
  // Se rimane solo "TERAMO" o varianti, normalizza a "Teramo"
  if (normalized.toLowerCase() === 'teramo') {
    return 'Teramo';
  }
  
  // Converti tutto maiuscolo a title case
  normalized = toTitleCase(normalized);
  
  return normalized;
}

/**
 * Normalizes city names - converts all Teramo variants to "Teramo" (first letter uppercase)
 * Also converts all uppercase to title case
 * @param city - The city name to normalize
 * @returns Normalized city name (Teramo for all Teramo variants)
 */
export function normalizeCity(city?: string): string {
  if (!city) return '';
  
  let normalized = city.trim();
  
  // Normalizza tutte le varianti di Teramo a "Teramo" (prima lettera maiuscola)
  const cityLower = normalized.toLowerCase();
  if (cityLower.includes('teramo')) {
    normalized = 'Teramo';
  } else {
    // Converti tutto maiuscolo a title case
    normalized = toTitleCase(normalized);
  }
  
  return normalized;
}

/**
 * Formats stop display removing duplicates between name and city
 * @param name - The stop name
 * @param city - The city name
 * @returns Formatted string without duplicates
 */
export function formatStopDisplay(name?: string, city?: string): string {
  const normalizedName = normalizeStopName(name);
  const normalizedCity = normalizeCity(city);
  
  // Se uno dei due è vuoto, mostra solo l'altro
  if (!normalizedName && normalizedCity) {
    return normalizedCity;
  }
  if (normalizedName && !normalizedCity) {
    return normalizedName;
  }
  if (!normalizedName && !normalizedCity) {
    return '';
  }
  
  // Se nome e città sono uguali (case-insensitive), mostra solo uno
  if (normalizedName.toLowerCase() === normalizedCity.toLowerCase()) {
    return normalizedName;
  }
  
  // Se il nome contiene già la città, mostra solo il nome
  if (normalizedName.toLowerCase().includes(normalizedCity.toLowerCase()) && normalizedCity) {
    return normalizedName;
  }
  
  // Se la città contiene già il nome, mostra solo la città
  if (normalizedCity.toLowerCase().includes(normalizedName.toLowerCase()) && normalizedName) {
    return normalizedCity;
  }
  
  // Rimuovi duplicati nel formato "Nome - Nome" o "Città - Città"
  // Se il nome contiene già un trattino con duplicati, puliscilo
  const nameParts = normalizedName.split(/\s*-\s*/);
  const uniqueNameParts = nameParts.filter((part, index, arr) => 
    arr.findIndex(p => p.toLowerCase() === part.toLowerCase()) === index
  );
  const cleanedName = uniqueNameParts.join(' - ');
  
  // Altrimenti mostra entrambi
  if (cleanedName && normalizedCity) {
    return `${cleanedName} - ${normalizedCity}`;
  }
  if (cleanedName) {
    return cleanedName;
  }
  if (normalizedCity) {
    return normalizedCity;
  }
  return '';
}

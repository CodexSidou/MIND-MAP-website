import { en, type Dict } from './en'
import { fr } from './fr'
import { ar } from './ar'
import { es } from './es'
import { de } from './de'
import { pt } from './pt'
import { zh } from './zh'
import type { Language } from '../types'

export const dicts: Record<Language, Dict> = { en, fr, ar, es, de, pt, zh }

export function t(lang: Language, key: keyof Dict): string {
  return dicts[lang][key] ?? en[key] ?? key
}

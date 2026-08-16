import en from "./en.json"
import hi from "./hi.json"

type NestedMessages = { [key: string]: string | NestedMessages }
type TranslationKey = string

const locales: Record<string, NestedMessages> = { en, hi }

let currentLocale = "en"

export function setLocale(locale: string) {
  if (locales[locale]) {
    currentLocale = locale
  }
}

export function getLocale(): string {
  return currentLocale
}

export function t(key: TranslationKey): string {
  const keys = key.split(".")
  let result: any = locales[currentLocale] || locales.en

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k]
    } else {
      let fallback: any = locales.en
      for (const fk of keys) {
        if (fallback && typeof fallback === "object" && fk in fallback) {
          fallback = fallback[fk]
        } else {
          return key
        }
      }
      return typeof fallback === "string" ? fallback : key
    }
  }

  return typeof result === "string" ? result : key
}

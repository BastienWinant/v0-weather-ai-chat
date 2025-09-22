// Location and time parsing utilities for weather queries
export interface ParsedLocation {
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
  formatted: string
}

export interface ParsedTimeframe {
  type: "current" | "forecast" | "specific"
  days?: number
  date?: string
  description: string
}

export class LocationTimeParser {
  // Common location patterns
  private static readonly LOCATION_PATTERNS = [
    // City, State patterns
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/g,
    // City, Country patterns
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    // Simple city names
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
    /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
  ]

  // Time-related keywords
  private static readonly TIME_KEYWORDS = {
    current: ["now", "current", "currently", "today", "right now"],
    tomorrow: ["tomorrow", "tmrw"],
    thisWeek: ["this week", "week", "weekly"],
    weekend: ["weekend", "this weekend"],
    nextWeek: ["next week"],
    specific: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  }

  static parseLocation(query: string): ParsedLocation | null {
    const normalizedQuery = query.trim()

    // Try to extract location using patterns
    for (const pattern of this.LOCATION_PATTERNS) {
      const matches = [...normalizedQuery.matchAll(pattern)]
      if (matches.length > 0) {
        const match = matches[0]
        if (match[2]) {
          // City, State/Country format
          return {
            city: match[1].trim(),
            state: match[2].length === 2 ? match[2] : undefined,
            country: match[2].length > 2 ? match[2] : undefined,
            formatted: `${match[1].trim()}, ${match[2].trim()}`,
          }
        } else if (match[1]) {
          // Simple city format
          return {
            city: match[1].trim(),
            formatted: match[1].trim(),
          }
        }
      }
    }

    // Fallback: look for capitalized words that might be locations
    const words = normalizedQuery.split(/\s+/)
    const capitalizedWords = words.filter((word) => /^[A-Z][a-z]+$/.test(word))

    if (capitalizedWords.length > 0) {
      const location = capitalizedWords.join(" ")
      return {
        city: location,
        formatted: location,
      }
    }

    return null
  }

  static parseTimeframe(query: string): ParsedTimeframe {
    const lowerQuery = query.toLowerCase()

    // Check for current weather keywords
    if (this.TIME_KEYWORDS.current.some((keyword) => lowerQuery.includes(keyword))) {
      return {
        type: "current",
        description: "current weather",
      }
    }

    // Check for tomorrow
    if (this.TIME_KEYWORDS.tomorrow.some((keyword) => lowerQuery.includes(keyword))) {
      return {
        type: "forecast",
        days: 1,
        description: "tomorrow's weather",
      }
    }

    // Check for this week
    if (this.TIME_KEYWORDS.thisWeek.some((keyword) => lowerQuery.includes(keyword))) {
      return {
        type: "forecast",
        days: 7,
        description: "this week's forecast",
      }
    }

    // Check for weekend
    if (this.TIME_KEYWORDS.weekend.some((keyword) => lowerQuery.includes(keyword))) {
      return {
        type: "forecast",
        days: 3,
        description: "weekend forecast",
      }
    }

    // Check for next week
    if (this.TIME_KEYWORDS.nextWeek.some((keyword) => lowerQuery.includes(keyword))) {
      return {
        type: "forecast",
        days: 7,
        description: "next week's forecast",
      }
    }

    // Check for specific days
    const specificDay = this.TIME_KEYWORDS.specific.find((day) => lowerQuery.includes(day))
    if (specificDay) {
      return {
        type: "specific",
        days: 7, // Get week forecast to find the specific day
        description: `${specificDay}'s weather`,
      }
    }

    // Check for forecast-related keywords
    if (lowerQuery.includes("forecast") || lowerQuery.includes("will") || lowerQuery.includes("going to")) {
      return {
        type: "forecast",
        days: 5,
        description: "weather forecast",
      }
    }

    // Default to current weather
    return {
      type: "current",
      description: "current weather",
    }
  }

  static parseQuery(query: string): {
    location: ParsedLocation | null
    timeframe: ParsedTimeframe
    originalQuery: string
  } {
    return {
      location: this.parseLocation(query),
      timeframe: this.parseTimeframe(query),
      originalQuery: query,
    }
  }
}

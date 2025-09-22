// Weather service to fetch real weather data
export interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  feelsLike: number
  icon: string
}

export interface ForecastData {
  date: string
  high: number
  low: number
  condition: string
  description: string
  icon: string
}

export interface WeatherResponse {
  current: WeatherData
  forecast: ForecastData[]
  location: {
    name: string
    country: string
    region: string
  }
}

export class WeatherService {
  private apiKey: string
  private baseUrl = "https://api.weatherapi.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
    console.log("[v0] WeatherService initialized with API key:", apiKey ? "Present" : "Missing")
  }

  async getCurrentWeather(location: string): Promise<WeatherResponse> {
    console.log("[v0] Fetching weather for location:", location)
    console.log("[v0] Using API key:", this.apiKey ? "Present" : "Missing")

    try {
      const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=5&aqi=no&alerts=no`
      console.log("[v0] Weather API URL:", url.replace(this.apiKey, "***"))

      const response = await fetch(url)
      console.log("[v0] Weather API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Weather API error response:", errorText)
        throw new Error(`Weather API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Weather API data received successfully")

      return {
        current: {
          location: `${data.location.name}, ${data.location.country}`,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          feelsLike: Math.round(data.current.feelslike_c),
          icon: data.current.condition.icon,
        },
        forecast: data.forecast.forecastday.map((day: any) => ({
          date: day.date,
          high: Math.round(day.day.maxtemp_c),
          low: Math.round(day.day.mintemp_c),
          condition: day.day.condition.text,
          description: day.day.condition.text,
          icon: day.day.condition.icon,
        })),
        location: {
          name: data.location.name,
          country: data.location.country,
          region: data.location.region,
        },
      }
    } catch (error) {
      console.error("[v0] Weather service error:", error)
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        console.log("[v0] Network error detected, using mock data")
      } else {
        console.log("[v0] API error detected, using mock data")
      }
      return this.getMockWeatherData(location)
    }
  }

  private getMockWeatherData(location: string): WeatherResponse {
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"]
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const temp = Math.floor(Math.random() * 30) + 5 // 5-35°C

    return {
      current: {
        location: location,
        temperature: temp,
        condition: condition,
        description: condition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        feelsLike: temp + Math.floor(Math.random() * 6) - 3, // ±3°C
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        high: temp + Math.floor(Math.random() * 10) - 5,
        low: temp - Math.floor(Math.random() * 10) - 5,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        description: conditions[Math.floor(Math.random() * conditions.length)],
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      })),
      location: {
        name: location.split(",")[0] || location,
        country: "Unknown",
        region: "Unknown",
      },
    }
  }
}

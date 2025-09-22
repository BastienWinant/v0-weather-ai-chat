import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
  validateUIMessages,
  type InferUITools,
  type UIDataTypes,
} from "ai"
import { z } from "zod"
import { WeatherService } from "@/lib/weather-service"
import { LocationTimeParser } from "@/lib/location-parser"

export const maxDuration = 30

const openaiModel = openai("gpt-4o-mini", {
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize weather service
const weatherService = new WeatherService(process.env.WEATHER_API_KEY || "")

const getWeatherTool = tool({
  description: "Get current weather information for a specific location",
  inputSchema: z.object({
    location: z.string().describe("The city, state, or country to get weather for"),
  }),
  execute: async ({ location }) => {
    console.log("[v0] Getting weather for:", location)
    try {
      const weatherData = await weatherService.getCurrentWeather(location)
      console.log("[v0] Weather data received:", weatherData)
      return {
        success: true,
        data: weatherData,
      }
    } catch (error) {
      console.log("[v0] Weather API error:", error)
      return {
        success: false,
        error: "Unable to fetch weather data for that location",
      }
    }
  },
})

const getForecastTool = tool({
  description: "Get weather forecast for a specific location and time period",
  inputSchema: z.object({
    location: z.string().describe("The city, state, or country to get forecast for"),
    days: z.number().optional().describe("Number of days to forecast (1-5)"),
  }),
  execute: async ({ location, days = 5 }) => {
    console.log("[v0] Getting forecast for:", location, "days:", days)
    try {
      const weatherData = await weatherService.getCurrentWeather(location)
      console.log("[v0] Forecast data received:", weatherData)
      return {
        success: true,
        data: {
          location: weatherData.location,
          forecast: weatherData.forecast.slice(0, days),
        },
      }
    } catch (error) {
      console.log("[v0] Forecast API error:", error)
      return {
        success: false,
        error: "Unable to fetch forecast data for that location",
      }
    }
  },
})

const parseQueryTool = tool({
  description: "Parse user query to extract location and time information for weather requests",
  inputSchema: z.object({
    query: z.string().describe("The user's weather query to parse"),
  }),
  execute: async ({ query }) => {
    console.log("[v0] Parsing query:", query)
    const parsed = LocationTimeParser.parseQuery(query)
    console.log("[v0] Parsed result:", parsed)
    return {
      success: true,
      data: parsed,
    }
  },
})

const tools = {
  getWeather: getWeatherTool,
  getForecast: getForecastTool,
  parseQuery: parseQueryTool,
} as const

export type WeatherChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  console.log("[v0] API route called")

  try {
    const body = await req.json()
    console.log("[v0] Request body:", body)

    const messages = await validateUIMessages<WeatherChatMessage>({
      messages: body.messages,
      tools,
    })

    console.log("[v0] Validated messages:", messages)

    const result = streamText({
      model: openaiModel,
      messages: convertToModelMessages(messages),
      tools,
      system: `You are a helpful weather assistant. You can provide current weather information and forecasts for any location.

WORKFLOW:
1. When a user asks about weather, directly use the appropriate weather tool:
   - For current weather: use getWeather tool
   - For forecasts/future weather: use getForecast tool
2. You can optionally use parseQuery to better understand complex queries, but always follow up with weather data
3. Always provide a complete, helpful response with the weather information

RESPONSE GUIDELINES:
- Be friendly and conversational
- Include specific details like temperature, conditions, and helpful advice
- Mention weather warnings when relevant (bring umbrella for rain, etc.)
- For forecasts, highlight key information for each day
- If you can't find a location, ask the user to clarify

LOCATION HANDLING:
- Accept various formats: "New York", "Paris, France", "Tokyo"
- Handle common abbreviations and informal names
- Default to major cities if ambiguous

IMPORTANT: Always provide weather data and a complete response. Don't just parse queries - actually get and share the weather information!`,
      maxTokens: 1000,
    })

    console.log("[v0] StreamText result created")
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] API route error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

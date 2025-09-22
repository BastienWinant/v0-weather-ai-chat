"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Cloud, MapPin, Clock } from "lucide-react"
import { WeatherCard } from "./weather-card"
import { ForecastCard } from "./forecast-card"
import { WeatherIcon } from "./weather-icon"

export function WeatherChat() {
  const [input, setInput] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/weather-chat" }),
    onError: (error) => {
      console.log("[v0] Chat error:", error)
    },
    onFinish: (message) => {
      console.log("[v0] Chat finished:", message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "in_progress") return

    console.log("[v0] Sending message:", input)
    sendMessage({ text: input })
    setInput("")
  }

  const renderWeatherData = (toolResult: any) => {
    console.log("[v0] Rendering tool result:", toolResult)

    if (!toolResult.success || !toolResult.data) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
          <p className="text-destructive text-sm">{toolResult.error || "Unable to fetch weather data"}</p>
        </div>
      )
    }

    const { data } = toolResult

    // Handle parsed query results
    if (data.location && data.timeframe && data.originalQuery) {
      return (
        <div className="bg-muted/50 border rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span>Parsed query</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>Location: {data.location?.formatted || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Timeframe: {data.timeframe.description}</span>
            </div>
          </div>
        </div>
      )
    }

    // Handle current weather data
    if (data.current) {
      return <WeatherCard weather={data.current} className="mt-3" />
    }

    // Handle forecast data
    if (data.forecast && data.location) {
      return <ForecastCard location={data.location} forecast={data.forecast} className="mt-3" />
    }

    return null
  }

  const quickSuggestions = [
    "What's the weather like in New York?",
    "Will it rain in London tomorrow?",
    "What's the forecast for Tokyo this week?",
    "How's the weather in Paris right now?",
    "Should I bring an umbrella in Seattle today?",
    "What's the temperature in Miami?",
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  Hi! I'm your weather assistant. Ask me about the weather in any location and time!
                </p>
                <div className="text-sm text-muted-foreground mb-4">I can understand queries like:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 bg-transparent"
                      onClick={() => setInput(suggestion)}
                    >
                      <span className="text-xs">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              console.log("[v0] Rendering message:", message)
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 mt-1">
                            <WeatherIcon
                              condition={message.parts[0]?.type === "text" ? message.parts[0].text : "cloudy"}
                              className="w-4 h-4 text-muted-foreground"
                            />
                          </div>
                        )}
                        <div className="text-sm leading-relaxed flex-1">
                          {message.parts.map((part, index) => {
                            console.log("[v0] Rendering part:", part)
                            if (part.type === "text") {
                              return <div key={index}>{part.text}</div>
                            }
                            if (part.type?.startsWith("tool-") && part.state === "output-available" && part.output) {
                              try {
                                return <div key={index}>{renderWeatherData(part.output)}</div>
                              } catch (error) {
                                console.log("[v0] Error rendering tool output:", error)
                                return (
                                  <div key={index} className="text-xs text-muted-foreground mt-2">
                                    Weather data processed
                                  </div>
                                )
                              }
                            }
                            if (part.type === "tool-result") {
                              try {
                                const result = typeof part.result === "string" ? JSON.parse(part.result) : part.result
                                return <div key={index}>{renderWeatherData(result)}</div>
                              } catch (error) {
                                console.log("[v0] Error parsing tool result:", error)
                                return (
                                  <div key={index} className="text-xs text-muted-foreground mt-2">
                                    Weather data processed
                                  </div>
                                )
                              }
                            }
                            if (
                              part.type?.startsWith("tool-") &&
                              (part.state === "input-streaming" || part.state === "input-available")
                            ) {
                              return (
                                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <div className="animate-spin">
                                    <Cloud className="w-3 h-3" />
                                  </div>
                                  <span>Getting weather data for {part.input?.location || "location"}...</span>
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {status === "in_progress" && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">
                        <Cloud className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather anywhere, anytime... (e.g., 'Will it rain in Paris tomorrow?')"
              disabled={status === "in_progress"}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || status === "in_progress"} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

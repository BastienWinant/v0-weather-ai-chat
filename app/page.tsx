import { WeatherChat } from "@/components/weather-chat"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Weather AI Assistant</h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Ask me about the weather anywhere, anytime. Just tell me the location and I'll get you the latest
              forecast.
            </p>
          </div>
          <WeatherChat />
        </div>
      </div>
    </main>
  )
}

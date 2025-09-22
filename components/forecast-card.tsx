import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar } from "lucide-react"
import { WeatherIcon } from "./weather-icon"

interface ForecastData {
  date: string
  high: number
  low: number
  condition: string
  description: string
  icon: string
}

interface ForecastCardProps {
  location: {
    name: string
    country: string
    region: string
  }
  forecast: ForecastData[]
  className?: string
}

export function ForecastCard({ location, forecast, className }: ForecastCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className={`bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-secondary" />
          Weather Forecast
        </CardTitle>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>
            {location.name}
            {location.country && `, ${location.country}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {forecast.slice(0, 5).map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <WeatherIcon condition={day.condition} className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{formatDate(day.date)}</div>
                <div className="text-xs text-muted-foreground">{day.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{day.high}°</span>
                <span className="text-muted-foreground">{day.low}°</span>
              </div>
              <div className="text-xs text-muted-foreground">High / Low</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

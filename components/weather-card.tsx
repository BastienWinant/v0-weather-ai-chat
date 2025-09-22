import { Card, CardContent } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, Eye, MapPin } from "lucide-react"
import { WeatherIcon } from "./weather-icon"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  feelsLike: number
  icon: string
}

interface WeatherCardProps {
  weather: WeatherData
  className?: string
}

export function WeatherCard({ weather, className }: WeatherCardProps) {
  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <WeatherIcon condition={weather.condition} className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                <span>{weather.location}</span>
              </div>
              <h3 className="font-semibold text-lg">{weather.condition}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{weather.temperature}°</div>
            <div className="text-xs text-muted-foreground">Celsius</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{weather.feelsLike}°C</div>
              <div className="text-xs text-muted-foreground">Feels like</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Droplets className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Wind className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{weather.windSpeed} km/h</div>
              <div className="text-xs text-muted-foreground">Wind speed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground">Temperature</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

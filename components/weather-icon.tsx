import { Cloud, Sun, CloudRain, Snowflake, Wind, CloudSnow, Zap, CloudDrizzle } from "lucide-react"

interface WeatherIconProps {
  condition: string
  className?: string
}

export function WeatherIcon({ condition, className = "w-4 h-4" }: WeatherIconProps) {
  const getIconComponent = (condition: string) => {
    const lowerCondition = condition.toLowerCase()

    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
      return Sun
    }
    if (lowerCondition.includes("rain") || lowerCondition.includes("shower")) {
      return CloudRain
    }
    if (lowerCondition.includes("drizzle")) {
      return CloudDrizzle
    }
    if (lowerCondition.includes("snow") || lowerCondition.includes("blizzard")) {
      return lowerCondition.includes("light") ? CloudSnow : Snowflake
    }
    if (lowerCondition.includes("thunder") || lowerCondition.includes("storm")) {
      return Zap
    }
    if (lowerCondition.includes("wind") || lowerCondition.includes("breezy")) {
      return Wind
    }
    if (lowerCondition.includes("cloudy") || lowerCondition.includes("overcast")) {
      return Cloud
    }

    // Default to cloud for unknown conditions
    return Cloud
  }

  const IconComponent = getIconComponent(condition)
  return <IconComponent className={className} />
}

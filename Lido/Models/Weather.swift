import Foundation

struct WeatherResponse: Codable {
    let main: WeatherMain
    let weather: [WeatherCondition]
    let name: String
}

struct WeatherMain: Codable {
    let temp: Double
    let feelsLike: Double
    let humidity: Int

    enum CodingKeys: String, CodingKey {
        case temp
        case feelsLike = "feels_like"
        case humidity
    }
}

struct WeatherCondition: Codable {
    let id: Int
    let main: String
    let description: String
    let icon: String
}

struct ForecastResponse: Codable {
    let list: [ForecastItem]
}

struct ForecastItem: Codable, Identifiable {
    let dt: TimeInterval
    let main: WeatherMain
    let weather: [WeatherCondition]

    var id: TimeInterval { dt }

    var date: Date { Date(timeIntervalSince1970: dt) }

    var tempCelsius: Int { Int(main.temp.rounded()) }

    var iconURL: URL? {
        guard let icon = weather.first?.icon else { return nil }
        return URL(string: "https://openweathermap.org/img/wn/\(icon)@2x.png")
    }
}

struct GeocodingResult: Codable {
    let lat: Double
    let lon: Double
    let name: String
    let country: String
}

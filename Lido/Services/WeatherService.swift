import Foundation

enum WeatherService {
    private static let apiKey = "253da2aff6af189d55143f822bf3161a"
    private static let baseURL = "https://api.openweathermap.org"

    static func geocode(query: String) async throws -> GeocodingResult? {
        let urlString = "\(baseURL)/geo/1.0/direct?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&limit=1&appid=\(apiKey)"
        guard let url = URL(string: urlString) else { return nil }
        let (data, _) = try await URLSession.shared.data(from: url)
        let results = try JSONDecoder().decode([GeocodingResult].self, from: data)
        return results.first
    }

    static func currentWeather(lat: Double, lon: Double) async throws -> WeatherResponse {
        let urlString = "\(baseURL)/data/2.5/weather?lat=\(lat)&lon=\(lon)&units=metric&appid=\(apiKey)"
        let url = URL(string: urlString)!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(WeatherResponse.self, from: data)
    }

    static func forecast(lat: Double, lon: Double) async throws -> ForecastResponse {
        let urlString = "\(baseURL)/data/2.5/forecast?lat=\(lat)&lon=\(lon)&units=metric&appid=\(apiKey)"
        let url = URL(string: urlString)!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(ForecastResponse.self, from: data)
    }
}

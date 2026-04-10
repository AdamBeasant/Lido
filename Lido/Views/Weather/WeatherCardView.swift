import SwiftUI

struct WeatherCardView: View {
    let weather: WeatherResponse
    let destination: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Current Weather")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                    .tracking(0.5)
                Spacer()
                Text(destination)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            HStack(alignment: .top, spacing: 16) {
                // Temperature
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(Int(weather.main.temp.rounded()))°")
                        .font(.system(size: 48, weight: .light))
                    if let condition = weather.weather.first {
                        Text(condition.description.capitalized)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                // Details
                VStack(alignment: .trailing, spacing: 6) {
                    Label("Feels \(Int(weather.main.feelsLike.rounded()))°", systemImage: "thermometer.medium")
                    Label("\(weather.main.humidity)%", systemImage: "humidity")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(20)
        .herouiCard()
    }
}

struct ForecastStripView: View {
    let items: [ForecastItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Forecast")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .tracking(0.5)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(items) { item in
                        VStack(spacing: 6) {
                            Text(dayLabel(item.date))
                                .font(.caption2)
                                .foregroundStyle(.secondary)

                            if let iconURL = item.iconURL {
                                AsyncImage(url: iconURL) { image in
                                    image.resizable()
                                } placeholder: {
                                    Color.clear
                                }
                                .frame(width: 32, height: 32)
                            }

                            Text("\(item.tempCelsius)°")
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                        .frame(width: 56)
                    }
                }
            }
        }
        .padding(20)
        .herouiCard()
    }

    private func dayLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date)
    }
}

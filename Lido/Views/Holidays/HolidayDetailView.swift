import SwiftUI

struct HolidayDetailView: View {
    let holiday: Holiday
    @State private var selectedTab = 0
    @State private var showingShare = false

    private let tabs = ["Overview", "Packing", "To-Do", "Restaurants"]

    var body: some View {
        VStack(spacing: 0) {
            // Hero image
            ZStack(alignment: .bottomLeading) {
                if let imageUrl = holiday.imageUrl, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { phase in
                        if let image = phase.image {
                            image.resizable().aspectRatio(contentMode: .fill)
                        } else {
                            Color(.systemGray5)
                        }
                    }
                } else {
                    LinearGradient(
                        colors: [Color.heroui.opacity(0.3), .purple.opacity(0.3)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }

                LinearGradient(
                    colors: [.clear, .black.opacity(0.6)],
                    startPoint: .center,
                    endPoint: .bottom
                )

                VStack(alignment: .leading, spacing: 4) {
                    CountdownBadge(holiday: holiday)
                    Text(holiday.name)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                    HStack(spacing: 4) {
                        Image(systemName: "mappin")
                            .font(.caption)
                        Text(holiday.destination)
                            .font(.subheadline)
                    }
                    .foregroundStyle(.white.opacity(0.85))
                }
                .padding(20)
            }
            .frame(height: 240)
            .clipped()

            // HeroUI-style pill tab bar
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                selectedTab = index
                            }
                        } label: {
                            Text(tab)
                                .font(.subheadline)
                                .fontWeight(selectedTab == index ? .semibold : .regular)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedTab == index ? Color.heroui : .clear)
                                .foregroundStyle(selectedTab == index ? .white : .secondary)
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(4)
                .background(Color(.systemGray6))
                .clipShape(Capsule())
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            // Tab content
            TabView(selection: $selectedTab) {
                OverviewTab(holiday: holiday)
                    .tag(0)
                ChecklistView(holidayId: holiday.id, listType: "packing")
                    .tag(1)
                ChecklistView(holidayId: holiday.id, listType: "todo")
                    .tag(2)
                RestaurantListView(holidayId: holiday.id)
                    .tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
        .background(Color(.systemBackground))
        .ignoresSafeArea(edges: .top)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingShare = true
                } label: {
                    Image(systemName: "person.badge.plus")
                        .foregroundStyle(.white)
                }
            }
        }
        .sheet(isPresented: $showingShare) {
            ShareHolidayView(holidayId: holiday.id)
        }
    }
}

struct OverviewTab: View {
    let holiday: Holiday
    @State private var weather: WeatherResponse?
    @State private var forecast: [ForecastItem] = []

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Date info card
                VStack(spacing: 0) {
                    InfoRow(icon: "calendar", label: "Dates", value: dateRange)
                    Divider().padding(.leading, 40)
                    InfoRow(icon: "clock", label: "Duration", value: "\(holiday.duration) days")
                    if holiday.isUpcoming {
                        Divider().padding(.leading, 40)
                        InfoRow(icon: "hourglass", label: "Countdown", value: "\(holiday.daysUntilStart) days to go")
                    }
                }
                .padding(20)
                .herouiCard()

                // Weather
                if let weather {
                    WeatherCardView(weather: weather, destination: holiday.destination)
                }

                if !forecast.isEmpty {
                    ForecastStripView(items: forecast)
                }
            }
            .padding(20)
        }
        .task { await loadWeather() }
    }

    private var dateRange: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return "\(formatter.string(from: holiday.startDate)) – \(formatter.string(from: holiday.endDate))"
    }

    private func loadWeather() async {
        guard let lat = holiday.latitude, let lon = holiday.longitude else { return }
        do {
            async let w = WeatherService.currentWeather(lat: lat, lon: lon)
            async let f = WeatherService.forecast(lat: lat, lon: lon)
            let (weatherResult, forecastResult) = try await (w, f)
            await MainActor.run {
                weather = weatherResult
                // Show one forecast per day (every 8th item = 24h intervals)
                forecast = forecastResult.list.enumerated()
                    .filter { $0.offset % 8 == 0 }
                    .map(\.element)
            }
        } catch {}
    }
}

struct InfoRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(Color.heroui)
                .frame(width: 24)
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .padding(.vertical, 6)
    }
}

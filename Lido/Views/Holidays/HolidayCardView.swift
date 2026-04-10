import SwiftUI

struct HolidayCardView: View {
    let holiday: Holiday

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Hero image
            ZStack(alignment: .bottomLeading) {
                if let imageUrl = holiday.imageUrl, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        case .failure:
                            placeholderGradient
                        default:
                            placeholderGradient
                                .overlay(ProgressView().tint(.white))
                        }
                    }
                } else {
                    placeholderGradient
                }

                // Gradient overlay
                LinearGradient(
                    colors: [.clear, .black.opacity(0.65)],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Content overlay
                VStack(alignment: .leading, spacing: 6) {
                    CountdownBadge(holiday: holiday)

                    Text(holiday.name)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)

                    HStack(spacing: 4) {
                        Image(systemName: "mappin")
                            .font(.caption)
                        Text(holiday.destination)
                            .font(.subheadline)
                    }
                    .foregroundStyle(.white.opacity(0.85))

                    Text(dateRange)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.65))
                }
                .padding(20)
            }
            .frame(height: 220)
        }
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 12, y: 4)
    }

    private var placeholderGradient: some View {
        LinearGradient(
            colors: [Color.heroui.opacity(0.3), .purple.opacity(0.3)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private var dateRange: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        let start = formatter.string(from: holiday.startDate)
        formatter.dateFormat = "d MMM yyyy"
        let end = formatter.string(from: holiday.endDate)
        return "\(start) – \(end) · \(holiday.duration) days"
    }
}

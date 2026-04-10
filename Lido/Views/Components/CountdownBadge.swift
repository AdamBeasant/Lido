import SwiftUI

struct CountdownBadge: View {
    let holiday: Holiday

    var body: some View {
        Text(label)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(badgeColor.opacity(0.12))
            .foregroundStyle(badgeColor)
            .clipShape(Capsule())
    }

    private var label: String {
        if holiday.isOngoing {
            return "Happening now"
        } else if holiday.isPast {
            return "Completed"
        } else {
            let days = holiday.daysUntilStart
            if days == 1 { return "Tomorrow!" }
            return "In \(days) days"
        }
    }

    private var badgeColor: Color {
        if holiday.isOngoing { return .green }
        if holiday.isPast { return .gray }
        if holiday.daysUntilStart <= 7 { return .orange }
        return .heroui
    }
}

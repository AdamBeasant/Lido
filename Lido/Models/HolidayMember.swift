import Foundation

struct HolidayMember: Codable, Identifiable, Hashable {
    let id: UUID
    let holidayId: UUID
    let userId: UUID
    let role: String
    let joinedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case holidayId = "holiday_id"
        case userId = "user_id"
        case role
        case joinedAt = "joined_at"
    }
}

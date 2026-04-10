import Foundation

struct ChecklistItem: Codable, Identifiable, Hashable {
    let id: UUID
    let holidayId: UUID
    var listType: String
    var category: String?
    var text: String
    var checked: Bool
    var checkedBy: UUID?
    var checkedAt: Date?
    var position: Int
    var createdBy: UUID?
    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case holidayId = "holiday_id"
        case listType = "list_type"
        case category, text, checked
        case checkedBy = "checked_by"
        case checkedAt = "checked_at"
        case position
        case createdBy = "created_by"
        case createdAt = "created_at"
    }
}

struct ChecklistItemInsert: Codable {
    let holidayId: UUID
    let listType: String
    let category: String?
    let text: String
    let position: Int
    let createdBy: UUID

    enum CodingKeys: String, CodingKey {
        case holidayId = "holiday_id"
        case listType = "list_type"
        case category, text, position
        case createdBy = "created_by"
    }
}

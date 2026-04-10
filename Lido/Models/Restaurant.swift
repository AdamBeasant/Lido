import Foundation

struct Restaurant: Codable, Identifiable, Hashable {
    let id: UUID
    let holidayId: UUID
    var name: String
    var cuisine: String?
    var notes: String?
    var rating: Int?
    var booked: Bool
    var url: String?
    var createdBy: UUID?
    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case holidayId = "holiday_id"
        case name, cuisine, notes, rating, booked, url
        case createdBy = "created_by"
        case createdAt = "created_at"
    }
}

struct RestaurantInsert: Codable {
    let holidayId: UUID
    let name: String
    let cuisine: String?
    let notes: String?
    let rating: Int?
    let booked: Bool
    let url: String?
    let createdBy: UUID

    enum CodingKeys: String, CodingKey {
        case holidayId = "holiday_id"
        case name, cuisine, notes, rating, booked, url
        case createdBy = "created_by"
    }
}

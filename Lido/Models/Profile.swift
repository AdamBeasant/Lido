import Foundation

struct Profile: Codable, Identifiable, Hashable {
    let id: UUID
    var email: String?
    var displayName: String?
    var avatarUrl: String?
    var updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, email
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case updatedAt = "updated_at"
    }
}

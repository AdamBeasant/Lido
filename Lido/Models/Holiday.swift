import Foundation

struct Holiday: Codable, Identifiable, Hashable {
    let id: UUID
    var name: String
    var destination: String
    var startDate: Date
    var endDate: Date
    var imageUrl: String?
    var imageBlurHash: String?
    var latitude: Double?
    var longitude: Double?
    var createdBy: UUID
    var createdAt: Date?
    var updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name, destination
        case startDate = "start_date"
        case endDate = "end_date"
        case imageUrl = "image_url"
        case imageBlurHash = "image_blur_hash"
        case latitude, longitude
        case createdBy = "created_by"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    private static let dateOnlyFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(identifier: "UTC")
        return f
    }()

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(UUID.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        destination = try c.decode(String.self, forKey: .destination)
        imageUrl = try c.decodeIfPresent(String.self, forKey: .imageUrl)
        imageBlurHash = try c.decodeIfPresent(String.self, forKey: .imageBlurHash)
        latitude = try c.decodeIfPresent(Double.self, forKey: .latitude)
        longitude = try c.decodeIfPresent(Double.self, forKey: .longitude)
        createdBy = try c.decode(UUID.self, forKey: .createdBy)
        createdAt = try c.decodeIfPresent(Date.self, forKey: .createdAt)
        updatedAt = try c.decodeIfPresent(Date.self, forKey: .updatedAt)

        // Supabase `date` columns return "yyyy-MM-dd" strings
        let startStr = try c.decode(String.self, forKey: .startDate)
        let endStr = try c.decode(String.self, forKey: .endDate)
        guard let sd = Self.dateOnlyFormatter.date(from: startStr) else {
            throw DecodingError.dataCorruptedError(forKey: .startDate, in: c,
                debugDescription: "Expected yyyy-MM-dd, got \(startStr)")
        }
        guard let ed = Self.dateOnlyFormatter.date(from: endStr) else {
            throw DecodingError.dataCorruptedError(forKey: .endDate, in: c,
                debugDescription: "Expected yyyy-MM-dd, got \(endStr)")
        }
        startDate = sd
        endDate = ed
    }

    var daysUntilStart: Int {
        Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: .now), to: Calendar.current.startOfDay(for: startDate)).day ?? 0
    }

    var daysUntilEnd: Int {
        Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: .now), to: Calendar.current.startOfDay(for: endDate)).day ?? 0
    }

    var isUpcoming: Bool { daysUntilStart > 0 }
    var isOngoing: Bool { daysUntilStart <= 0 && daysUntilEnd >= 0 }
    var isPast: Bool { daysUntilEnd < 0 }

    var duration: Int {
        (Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 0) + 1
    }
}

struct HolidayInsert: Codable {
    let name: String
    let destination: String
    let startDate: String   // pre-formatted "yyyy-MM-dd"
    let endDate: String     // pre-formatted "yyyy-MM-dd"
    let imageUrl: String?
    let latitude: Double?
    let longitude: Double?
    let createdBy: UUID

    enum CodingKeys: String, CodingKey {
        case name, destination
        case startDate = "start_date"
        case endDate = "end_date"
        case imageUrl = "image_url"
        case latitude, longitude
        case createdBy = "created_by"
    }
}

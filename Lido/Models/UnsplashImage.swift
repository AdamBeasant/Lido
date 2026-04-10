import Foundation

struct UnsplashSearchResponse: Codable {
    let results: [UnsplashPhoto]
}

struct UnsplashPhoto: Codable, Identifiable {
    let id: String
    let urls: UnsplashURLs
    let user: UnsplashUser

    var fullURL: String { urls.regular }
    var thumbURL: String { urls.thumb }
    var credit: String { user.name }
}

struct UnsplashURLs: Codable {
    let raw: String
    let full: String
    let regular: String
    let small: String
    let thumb: String
}

struct UnsplashUser: Codable {
    let name: String
}

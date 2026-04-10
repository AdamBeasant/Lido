import Foundation

enum UnsplashService {
    private static let accessKey = "k_3hHaC8gBE7jGx1x_ULUs5wurNO_S14UYfTkxFf5qw"
    private static let baseURL = "https://api.unsplash.com"

    static func searchPhotos(query: String, perPage: Int = 6) async throws -> [UnsplashPhoto] {
        let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "\(baseURL)/search/photos?query=\(encoded)&per_page=\(perPage)&orientation=landscape"
        guard let url = URL(string: urlString) else { return [] }

        var request = URLRequest(url: url)
        request.setValue("Client-ID \(accessKey)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(UnsplashSearchResponse.self, from: data)
        return response.results
    }
}

import SwiftUI

struct CreateHolidayView: View {
    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    var onCreated: (Holiday) -> Void

    @State private var name = ""
    @State private var destination = ""
    @State private var startDate = Date()
    @State private var endDate = Calendar.current.date(byAdding: .day, value: 7, to: Date())!
    @State private var photos: [UnsplashPhoto] = []
    @State private var selectedImageUrl: String?
    @State private var searchingPhotos = false
    @State private var saving = false
    @State private var errorMessage: String?

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(identifier: "UTC")
        return f
    }()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    LidoTextField(label: "Trip name", placeholder: "Summer in Santorini", text: $name)

                    VStack(alignment: .leading, spacing: 6) {
                        LidoTextField(label: "Destination", placeholder: "Santorini, Greece", text: $destination)
                        if !destination.isEmpty {
                            Button {
                                Task { await searchPhotos() }
                            } label: {
                                Text(searchingPhotos ? "Searching..." : "Find cover photos")
                                    .font(.caption)
                                    .foregroundStyle(Color.heroui)
                            }
                            .disabled(searchingPhotos)
                        }
                    }

                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Start date")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.secondary)
                            DatePicker("", selection: $startDate, displayedComponents: .date)
                                .labelsHidden()
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Text("End date")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.secondary)
                            DatePicker("", selection: $endDate, in: startDate..., displayedComponents: .date)
                                .labelsHidden()
                        }
                    }

                    // Photo picker
                    if !photos.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Cover photo")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.secondary)

                            LazyVGrid(columns: [.init(.flexible()), .init(.flexible()), .init(.flexible())], spacing: 8) {
                                ForEach(photos) { photo in
                                    AsyncImage(url: URL(string: photo.thumbURL)) { phase in
                                        if let image = phase.image {
                                            image
                                                .resizable()
                                                .aspectRatio(16/10, contentMode: .fill)
                                        } else {
                                            Color(.systemGray5)
                                                .aspectRatio(16/10, contentMode: .fill)
                                        }
                                    }
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(selectedImageUrl == photo.fullURL ? Color.heroui : Color.clear, lineWidth: 3)
                                    )
                                    .onTapGesture {
                                        selectedImageUrl = photo.fullURL
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(24)
            }
            .navigationTitle("New Holiday")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task { await createHoliday() }
                    }
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.heroui)
                    .disabled(saving || !isValid)
                }
            }
            .alert("Error", isPresented: Binding<Bool>(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "Something went wrong.")
            }
        }
    }

    private var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !destination.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func searchPhotos() async {
        searchingPhotos = true
        do {
            let results = try await UnsplashService.searchPhotos(query: destination)
            await MainActor.run {
                photos = results
                if selectedImageUrl == nil, let first = results.first {
                    selectedImageUrl = first.fullURL
                }
                searchingPhotos = false
            }
        } catch {
            await MainActor.run { searchingPhotos = false }
        }
    }

    private func createHoliday() async {
        guard let userId = authManager.userId else { return }
        saving = true

        // Geocode destination
        var lat: Double?
        var lon: Double?
        if let geo = try? await WeatherService.geocode(query: destination) {
            lat = geo.lat
            lon = geo.lon
        }

        let insert = HolidayInsert(
            name: name,
            destination: destination,
            startDate: Self.dateFormatter.string(from: startDate),
            endDate: Self.dateFormatter.string(from: endDate),
            imageUrl: selectedImageUrl,
            latitude: lat,
            longitude: lon,
            createdBy: userId
        )

        do {
            let holiday: Holiday = try await supabase
                .from("holidays")
                .insert(insert)
                .select()
                .single()
                .execute()
                .value
            await MainActor.run {
                onCreated(holiday)
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                saving = false
            }
        }
    }
}

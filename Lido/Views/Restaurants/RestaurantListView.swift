import SwiftUI

struct RestaurantListView: View {
    let holidayId: UUID

    @Environment(AuthManager.self) private var authManager
    @State private var restaurants: [Restaurant] = []
    @State private var loading = true
    @State private var showingAdd = false

    var body: some View {
        VStack(spacing: 0) {
            if loading {
                ProgressView()
                    .tint(Color.heroui)
                    .frame(maxHeight: .infinity)
            } else if restaurants.isEmpty {
                VStack(spacing: 16) {
                    Spacer()
                    Image(systemName: "fork.knife.circle")
                        .font(.system(size: 48))
                        .foregroundStyle(Color.heroui.opacity(0.4))
                    VStack(spacing: 6) {
                        Text("No restaurants yet")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(.secondary)
                        Text("Save places you want to try")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    Button {
                        showingAdd = true
                    } label: {
                        Text("Add restaurant")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.heroui)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    Spacer()
                }
            } else {
                List {
                    ForEach(restaurants) { restaurant in
                        RestaurantCardView(restaurant: restaurant)
                            .listRowInsets(EdgeInsets(top: 6, leading: 20, bottom: 6, trailing: 20))
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                    }
                    .onDelete(perform: deleteRestaurants)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
                .background(Color(.systemBackground))
            }

            // Add button
            Button {
                showingAdd = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text("Add restaurant")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(Color.heroui)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(.white)
            .overlay(alignment: .top) {
                Rectangle()
                    .fill(Color(.systemGray5))
                    .frame(height: 1)
            }
        }
        .background(Color(.systemBackground))
        .sheet(isPresented: $showingAdd) {
            RestaurantFormView(holidayId: holidayId) { restaurant in
                withAnimation { restaurants.append(restaurant) }
            }
        }
        .task { await loadRestaurants() }
    }

    private func loadRestaurants() async {
        do {
            let result: [Restaurant] = try await supabase
                .from("restaurants")
                .select()
                .eq("holiday_id", value: holidayId)
                .order("created_at", ascending: false)
                .execute()
                .value
            await MainActor.run {
                restaurants = result
                loading = false
            }
        } catch {
            await MainActor.run { loading = false }
        }
    }

    private func deleteRestaurants(at offsets: IndexSet) {
        let toDelete = offsets.map { restaurants[$0] }
        withAnimation { restaurants.remove(atOffsets: offsets) }
        Task {
            for r in toDelete {
                try? await supabase.from("restaurants").delete().eq("id", value: r.id).execute()
            }
        }
    }
}

struct RestaurantCardView: View {
    let restaurant: Restaurant

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(restaurant.name)
                    .font(.headline)
                Spacer()
                if restaurant.booked {
                    Text("Booked")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(.green.opacity(0.12))
                        .foregroundStyle(.green)
                        .clipShape(Capsule())
                }
            }

            HStack(spacing: 12) {
                if let cuisine = restaurant.cuisine, !cuisine.isEmpty {
                    Label(cuisine, systemImage: "fork.knife")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                if let rating = restaurant.rating {
                    HStack(spacing: 2) {
                        ForEach(1...5, id: \.self) { star in
                            Image(systemName: star <= rating ? "star.fill" : "star")
                                .font(.caption2)
                                .foregroundStyle(star <= rating ? .orange : Color(.systemGray4))
                        }
                    }
                }
            }

            if let notes = restaurant.notes, !notes.isEmpty {
                Text(notes)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
        }
        .padding(20)
        .herouiCard()
    }
}

struct RestaurantFormView: View {
    let holidayId: UUID
    var onCreated: (Restaurant) -> Void

    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var cuisine = ""
    @State private var notes = ""
    @State private var rating: Int?
    @State private var booked = false
    @State private var url = ""
    @State private var saving = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Restaurant name", text: $name)
                    TextField("Cuisine (e.g. Italian)", text: $cuisine)
                }
                Section {
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Website URL", text: $url)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                }
                Section {
                    Toggle("Booked", isOn: $booked)
                        .tint(Color.heroui)
                    HStack {
                        Text("Rating")
                        Spacer()
                        HStack(spacing: 4) {
                            ForEach(1...5, id: \.self) { star in
                                Button {
                                    rating = rating == star ? nil : star
                                } label: {
                                    Image(systemName: (rating ?? 0) >= star ? "star.fill" : "star")
                                        .foregroundStyle((rating ?? 0) >= star ? .orange : Color(.systemGray4))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Add Restaurant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.heroui)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || saving)
                }
            }
        }
    }

    private func save() async {
        guard let userId = authManager.userId else { return }
        saving = true

        let insert = RestaurantInsert(
            holidayId: holidayId,
            name: name,
            cuisine: cuisine.isEmpty ? nil : cuisine,
            notes: notes.isEmpty ? nil : notes,
            rating: rating,
            booked: booked,
            url: url.isEmpty ? nil : url,
            createdBy: userId
        )

        do {
            let restaurant: Restaurant = try await supabase
                .from("restaurants")
                .insert(insert)
                .select()
                .single()
                .execute()
                .value
            await MainActor.run {
                onCreated(restaurant)
                dismiss()
            }
        } catch {
            await MainActor.run { saving = false }
        }
    }
}

import SwiftUI

struct HolidayListView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var holidays: [Holiday] = []
    @State private var loading = true
    @State private var showingCreate = false
    @State private var showingProfile = false

    var body: some View {
        NavigationStack {
            ScrollView {
                if loading {
                    ProgressView()
                        .tint(Color.heroui)
                        .padding(.top, 100)
                } else if holidays.isEmpty {
                    emptyState
                } else {
                    LazyVStack(spacing: 20) {
                        ForEach(holidays) { holiday in
                            NavigationLink(value: holiday) {
                                HolidayCardView(holiday: holiday)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                    .padding(.bottom, 100)
                }
            }
            .background(Color(.systemBackground))
            .navigationTitle("Holidays")
            .navigationDestination(for: Holiday.self) { holiday in
                HolidayDetailView(holiday: holiday)
            }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showingProfile = true
                    } label: {
                        Image(systemName: "person.circle")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingCreate = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.heroui)
                    }
                }
            }
            .sheet(isPresented: $showingCreate) {
                CreateHolidayView(onCreated: { holiday in
                    holidays.insert(holiday, at: 0)
                })
            }
            .sheet(isPresented: $showingProfile) {
                ProfileSheet()
            }
            .refreshable {
                await loadHolidays()
            }
        }
        .tint(Color.heroui)
        .task { await loadHolidays() }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "sun.horizon.fill")
                .font(.system(size: 56))
                .foregroundStyle(Color.heroui.opacity(0.5))

            VStack(spacing: 8) {
                Text("No holidays yet")
                    .font(.title3)
                    .fontWeight(.semibold)
                Text("Tap + to plan your first trip")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Button {
                showingCreate = true
            } label: {
                Text("Create holiday")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.heroui)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
    }

    private func loadHolidays() async {
        do {
            let result: [Holiday] = try await supabase
                .from("holidays")
                .select()
                .order("start_date", ascending: true)
                .execute()
                .value
            await MainActor.run {
                holidays = result
                loading = false
            }
        } catch {
            await MainActor.run { loading = false }
        }
    }
}

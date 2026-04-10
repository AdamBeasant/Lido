import SwiftUI

struct ShareHolidayView: View {
    let holidayId: UUID

    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss
    @State private var inviteLink: String?
    @State private var loading = false
    @State private var copied = false
    @State private var members: [HolidayMember] = []

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Members card
                if !members.isEmpty {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Members")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)
                            .textCase(.uppercase)
                            .tracking(0.5)
                            .padding(.bottom, 12)

                        ForEach(Array(members.enumerated()), id: \.element.id) { index, member in
                            HStack(spacing: 12) {
                                Image(systemName: "person.circle.fill")
                                    .font(.title2)
                                    .foregroundStyle(Color.heroui.opacity(0.5))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(member.userId.uuidString.prefix(8) + "...")
                                        .font(.subheadline)
                                    Text(member.role.capitalized)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 10)

                            if index < members.count - 1 {
                                Divider().padding(.leading, 44)
                            }
                        }
                    }
                    .padding(20)
                    .herouiCard()
                }

                // Invite card
                VStack(spacing: 16) {
                    Text("Invite someone")
                        .font(.headline)

                    if let inviteLink {
                        VStack(spacing: 14) {
                            Text(inviteLink)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .padding(12)
                                .frame(maxWidth: .infinity)
                                .background(Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 10))

                            // Primary button
                            Button {
                                UIPasteboard.general.string = inviteLink
                                copied = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    copied = false
                                }
                            } label: {
                                Label(copied ? "Copied!" : "Copy link", systemImage: copied ? "checkmark" : "doc.on.doc")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(Color.heroui)
                                    .foregroundStyle(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                    } else {
                        // Primary button
                        Button {
                            Task { await generateLink() }
                        } label: {
                            Label(loading ? "Generating..." : "Generate invite link", systemImage: "link.badge.plus")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(Color.heroui)
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(loading)
                    }

                    Text("Link expires in 7 days")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding(20)
                .herouiCard()

                Spacer()
            }
            .padding(20)
            .background(Color(.systemBackground))
            .navigationTitle("Share")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .fontWeight(.medium)
                        .foregroundStyle(Color.heroui)
                }
            }
        }
        .task { await loadMembers() }
    }

    private func loadMembers() async {
        do {
            let result: [HolidayMember] = try await supabase
                .from("holiday_members")
                .select()
                .eq("holiday_id", value: holidayId)
                .execute()
                .value
            await MainActor.run { members = result }
        } catch {}
    }

    private func generateLink() async {
        guard let userId = authManager.userId else { return }
        loading = true

        struct InviteInsert: Codable {
            let holiday_id: UUID
            let created_by: UUID
        }

        struct InviteResult: Codable {
            let token: String
        }

        do {
            let result: InviteResult = try await supabase
                .from("invite_tokens")
                .insert(InviteInsert(holiday_id: holidayId, created_by: userId))
                .select("token")
                .single()
                .execute()
                .value

            let link = "https://jaizsedfcbzgfaswzutt.supabase.co/invite/\(result.token)"
            await MainActor.run {
                inviteLink = link
                loading = false
            }
        } catch {
            await MainActor.run { loading = false }
        }
    }
}

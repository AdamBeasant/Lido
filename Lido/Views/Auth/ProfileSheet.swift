import SwiftUI

struct ProfileSheet: View {
    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()

                // Avatar card
                VStack(spacing: 16) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 72))
                        .foregroundStyle(Color.heroui.opacity(0.6))

                    if let email = authManager.currentUser?.email {
                        Text(email)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 32)
                .herouiCard()

                Spacer()

                // Sign out button - danger outlined style
                Button(role: .destructive) {
                    Task {
                        try? await authManager.signOut()
                        dismiss()
                    }
                } label: {
                    Text("Sign out")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(.red.opacity(0.4), lineWidth: 1)
                        )
                }
                .padding(.bottom, 8)
            }
            .padding(24)
            .background(Color(.systemBackground))
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .fontWeight(.medium)
                        .foregroundStyle(Color.heroui)
                }
            }
        }
    }
}

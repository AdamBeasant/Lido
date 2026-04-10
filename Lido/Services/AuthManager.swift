import Foundation
import Observation
import Supabase

@Observable
final class AuthManager {
    var currentUser: User?
    var isLoading = true

    var isAuthenticated: Bool { currentUser != nil }
    var userId: UUID? { currentUser?.id }

    init() {
        Task { await initialize() }
    }

    private func initialize() async {
        do {
            let session = try await supabase.auth.session
            currentUser = session.user
        } catch {
            currentUser = nil
        }
        isLoading = false

        Task {
            for await (event, session) in supabase.auth.authStateChanges {
                await MainActor.run {
                    switch event {
                    case .signedIn, .tokenRefreshed:
                        self.currentUser = session?.user
                    case .signedOut:
                        self.currentUser = nil
                    default:
                        break
                    }
                }
            }
        }
    }

    func signUp(email: String, password: String) async throws {
        let response = try await supabase.auth.signUp(email: email, password: password)
        await MainActor.run {
            self.currentUser = response.user
        }
    }

    func signIn(email: String, password: String) async throws {
        let session = try await supabase.auth.signIn(email: email, password: password)
        await MainActor.run {
            self.currentUser = session.user
        }
    }

    func signInWithMagicLink(email: String) async throws {
        try await supabase.auth.signInWithOTP(email: email)
    }

    func signOut() async throws {
        try await supabase.auth.signOut()
        await MainActor.run {
            self.currentUser = nil
        }
    }
}

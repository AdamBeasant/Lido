import SwiftUI

struct LoginView: View {
    enum Mode { case signin, signup, magic }

    @Environment(AuthManager.self) private var authManager
    @State private var email = ""
    @State private var password = ""
    @State private var mode: Mode = .signin
    @State private var loading = false
    @State private var error: String?
    @State private var magicSent = false

    var body: some View {
        if magicSent {
            magicSentView
        } else {
            loginForm
        }
    }

    private var magicSentView: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "envelope.circle.fill")
                .font(.system(size: 56))
                .foregroundStyle(Color.heroui.opacity(0.7))
            Text("Check your email")
                .font(.headline)
            Text("We sent a sign-in link to **\(email)**")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Back to sign in") {
                magicSent = false
                mode = .signin
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundStyle(Color.heroui)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(Color.heroui.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .padding(.top, 4)
            Spacer()
        }
        .padding(24)
    }

    private var loginForm: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 8) {
                    Text("Lido")
                        .font(.system(size: 40, weight: .bold, design: .default))
                        .tracking(-1)
                        .foregroundStyle(Color.heroui)
                    Text("Your holiday companion")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 60)

                // Form
                VStack(spacing: 20) {
                    // Google sign-in placeholder
                    Button {
                        // Google OAuth — requires additional setup
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "globe")
                                .font(.title3)
                            Text("Continue with Google")
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(.primary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)

                    // Divider
                    HStack {
                        Rectangle().fill(Color(.systemGray5)).frame(height: 1)
                        Text("OR")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                            .textCase(.uppercase)
                            .tracking(1)
                        Rectangle().fill(Color(.systemGray5)).frame(height: 1)
                    }

                    // Fields
                    VStack(spacing: 16) {
                        LidoTextField(label: "Email", placeholder: "you@example.com", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        if mode != .magic {
                            LidoTextField(label: "Password", placeholder: "••••••••", text: $password, isSecure: true)
                                .textContentType(mode == .signup ? .newPassword : .password)
                        }

                        if let error {
                            Text(error)
                                .font(.subheadline)
                                .foregroundStyle(.red)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Button {
                            Task { await handleSubmit() }
                        } label: {
                            Text(submitTitle)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.heroui)
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(loading || !isFormValid)
                        .opacity(isFormValid ? 1 : 0.5)
                    }

                    // Mode switchers
                    VStack(spacing: 12) {
                        switch mode {
                        case .signin:
                            Button { withAnimation { mode = .signup; error = nil } } label: {
                                Text("Don't have an account? ")
                                    .foregroundStyle(.secondary) +
                                Text("Sign up")
                                    .fontWeight(.semibold)
                                    .foregroundStyle(Color.heroui)
                            }
                            .font(.subheadline)

                            Button { withAnimation { mode = .magic; error = nil } } label: {
                                Text("Use magic link instead")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }

                        case .signup:
                            Button { withAnimation { mode = .signin; error = nil } } label: {
                                Text("Already have an account? ")
                                    .foregroundStyle(.secondary) +
                                Text("Sign in")
                                    .fontWeight(.semibold)
                                    .foregroundStyle(Color.heroui)
                            }
                            .font(.subheadline)

                        case .magic:
                            Button { withAnimation { mode = .signin; error = nil } } label: {
                                Text("Use password instead")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.top, 4)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .background(Color(.systemBackground))
        .scrollDismissesKeyboard(.interactively)
    }

    private var submitTitle: String {
        if loading { return "Loading..." }
        switch mode {
        case .signin: return "Sign in"
        case .signup: return "Create account"
        case .magic: return "Send magic link"
        }
    }

    private var isFormValid: Bool {
        let hasEmail = !email.trimmingCharacters(in: .whitespaces).isEmpty
        if mode == .magic { return hasEmail }
        return hasEmail && password.count >= 6
    }

    private func handleSubmit() async {
        loading = true
        error = nil
        do {
            switch mode {
            case .signup:
                try await authManager.signUp(email: email, password: password)
            case .signin:
                try await authManager.signIn(email: email, password: password)
            case .magic:
                try await authManager.signInWithMagicLink(email: email)
                await MainActor.run { magicSent = true }
            }
        } catch {
            await MainActor.run { self.error = error.localizedDescription }
        }
        await MainActor.run { loading = false }
    }
}

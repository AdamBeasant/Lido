import SwiftUI

extension Color {
    /// HeroUI primary purple-blue accent
    static let heroui = Color(red: 0.44, green: 0.36, blue: 0.96)

    /// Subtle card shadow color
    static let herouiShadow = Color.black.opacity(0.04)
}

/// Shared shadow modifier matching HeroUI's barely-there elevation style
struct HeroUICardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .herouiShadow, radius: 12, y: 4)
    }
}

extension View {
    func herouiCard() -> some View {
        modifier(HeroUICardStyle())
    }
}

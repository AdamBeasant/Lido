import Foundation
import Supabase

enum SupabaseConfig {
    static let url = URL(string: "https://jaizsedfcbzgfaswzutt.supabase.co")!
    static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaXpzZWRmY2J6Z2Zhc3d6dXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTU1NTAsImV4cCI6MjA5MTMzMTU1MH0.V80Krz6xIScs5BkWjo-ZBlOReroKfxistm_2xeak7wI"
}

let supabase = SupabaseClient(
    supabaseURL: SupabaseConfig.url,
    supabaseKey: SupabaseConfig.anonKey
)

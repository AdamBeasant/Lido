import SwiftUI

struct ChecklistView: View {
    let holidayId: UUID
    let listType: String

    @Environment(AuthManager.self) private var authManager
    @State private var items: [ChecklistItem] = []
    @State private var newItemText = ""
    @State private var loading = true

    private var checkedCount: Int { items.filter(\.checked).count }
    private var totalCount: Int { items.count }

    var body: some View {
        VStack(spacing: 0) {
            if !items.isEmpty {
                // Progress bar
                VStack(spacing: 8) {
                    HStack {
                        Text("\(checkedCount)/\(totalCount) \(listType == "packing" ? "packed" : "done")")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                        if totalCount > 0 {
                            Text("\(Int(Double(checkedCount) / Double(totalCount) * 100))%")
                                .font(.caption2)
                                .fontWeight(.medium)
                                .foregroundStyle(.secondary)
                        }
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color(.systemGray5))
                            Capsule()
                                .fill(totalCount > 0 && checkedCount == totalCount ? .green : Color.heroui)
                                .frame(width: totalCount > 0 ? geo.size.width * CGFloat(checkedCount) / CGFloat(totalCount) : 0)
                                .animation(.spring(duration: 0.4), value: checkedCount)
                        }
                    }
                    .frame(height: 4)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 12)
            }

            if loading {
                ProgressView()
                    .tint(Color.heroui)
                    .frame(maxHeight: .infinity)
            } else {
                List {
                    ForEach(items) { item in
                        ChecklistItemRow(item: item) { checked in
                            await toggleItem(item, checked: checked)
                        }
                        .listRowInsets(EdgeInsets(top: 4, leading: 20, bottom: 4, trailing: 20))
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                    }
                    .onDelete(perform: deleteItems)
                    .onMove(perform: moveItems)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
                .background(Color(.systemBackground))
            }

            // Quick add
            HStack(spacing: 12) {
                Image(systemName: "plus.circle.fill")
                    .font(.title3)
                    .foregroundStyle(Color.heroui)
                TextField("Add item...", text: $newItemText)
                    .textFieldStyle(.plain)
                    .submitLabel(.done)
                    .onSubmit { Task { await addItem() } }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(.white)
            .overlay(alignment: .top) {
                Rectangle()
                    .fill(Color(.systemGray5))
                    .frame(height: 1)
            }
        }
        .background(Color(.systemBackground))
        .task { await loadItems() }
    }

    private func loadItems() async {
        do {
            let result: [ChecklistItem] = try await supabase
                .from("checklist_items")
                .select()
                .eq("holiday_id", value: holidayId)
                .eq("list_type", value: listType)
                .order("position", ascending: true)
                .execute()
                .value
            await MainActor.run {
                items = result
                loading = false
            }
        } catch {
            await MainActor.run { loading = false }
        }
    }

    private func addItem() async {
        let text = newItemText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty, let userId = authManager.userId else { return }

        let insert = ChecklistItemInsert(
            holidayId: holidayId,
            listType: listType,
            category: nil,
            text: text,
            position: items.count,
            createdBy: userId
        )

        await MainActor.run { newItemText = "" }

        do {
            let item: ChecklistItem = try await supabase
                .from("checklist_items")
                .insert(insert)
                .select()
                .single()
                .execute()
                .value
            await MainActor.run {
                withAnimation(.spring(duration: 0.3)) {
                    items.append(item)
                }
            }
        } catch {}
    }

    private func toggleItem(_ item: ChecklistItem, checked: Bool) async {
        guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }

        await MainActor.run {
            withAnimation(.spring(duration: 0.3)) {
                items[index].checked = checked
            }
        }

        struct CheckUpdate: Codable {
            let checked: Bool
            let checked_by: String?
            let checked_at: String?
        }

        let update = CheckUpdate(
            checked: checked,
            checked_by: checked ? authManager.userId?.uuidString : nil,
            checked_at: checked ? ISO8601DateFormatter().string(from: Date()) : nil
        )

        do {
            try await supabase
                .from("checklist_items")
                .update(update)
                .eq("id", value: item.id)
                .execute()
        } catch {
            await MainActor.run {
                if let idx = items.firstIndex(where: { $0.id == item.id }) {
                    items[idx].checked = !checked
                }
            }
        }
    }

    private func deleteItems(at offsets: IndexSet) {
        let toDelete = offsets.map { items[$0] }
        withAnimation { items.remove(atOffsets: offsets) }
        Task {
            for item in toDelete {
                _ = try? await supabase
                    .from("checklist_items")
                    .delete()
                    .eq("id", value: item.id)
                    .execute()
            }
        }
    }

    private func moveItems(from source: IndexSet, to destination: Int) {
        items.move(fromOffsets: source, toOffset: destination)

        struct PositionUpdate: Codable {
            let position: Int
        }

        Task {
            for (index, item) in items.enumerated() {
                _ = try? await supabase
                    .from("checklist_items")
                    .update(PositionUpdate(position: index))
                    .eq("id", value: item.id)
                    .execute()
            }
        }
    }
}

struct ChecklistItemRow: View {
    let item: ChecklistItem
    let onToggle: (Bool) async -> Void

    var body: some View {
        HStack(spacing: 14) {
            Button {
                Task { await onToggle(!item.checked) }
            } label: {
                Image(systemName: item.checked ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.checked ? .heroui : Color(.systemGray4))
                    .contentTransition(.symbolEffect(.replace))
            }
            .buttonStyle(.plain)

            Text(item.text)
                .font(.body)
                .strikethrough(item.checked, color: .secondary)
                .foregroundStyle(item.checked ? .secondary : .primary)
                .animation(.easeInOut(duration: 0.2), value: item.checked)

            Spacer()
        }
        .padding(.vertical, 8)
    }
}

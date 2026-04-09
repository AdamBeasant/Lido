export const PACKING_CATEGORIES = [
  "Clothes",
  "Toiletries",
  "Electronics",
  "Documents",
  "Accessories",
  "Misc",
] as const;

export const DEFAULT_PACKING_ITEMS: Record<string, string[]> = {
  Documents: ["Passport", "Boarding pass", "Travel insurance", "Hotel confirmation"],
  Clothes: ["Swimwear", "Underwear", "Socks", "T-shirts", "Shorts"],
  Toiletries: ["Sunscreen", "Toothbrush", "Toothpaste", "Shampoo"],
  Electronics: ["Phone charger", "Power adapter", "Headphones"],
  Accessories: ["Sunglasses", "Hat", "Watch"],
  Misc: ["Book", "Snacks", "Water bottle"],
};

export type Subscription = { id: number; name: string; category: string; price: number; billingDay: number; workspace: string; color: string; period: string; logoUrl?: string };
export type DashboardData = { user: { name: string; email: string }; subscriptions: Subscription[] };

export const dashboardData: DashboardData = {
  user: { name: "Jordan Dale", email: "jordan@example.com" },
  subscriptions: [
    { id: 1, name: "Netflix", logoUrl: "https://cdn.simpleicons.org/netflix/FFFFFF", category: "Entertainment", price: 22.99, billingDay: 24, workspace: "Personal", color: "#17171a", period: "monthly" },
    { id: 2, name: "Spotify", logoUrl: "https://cdn.simpleicons.org/spotify/FFFFFF", category: "Entertainment", price: 11.99, billingDay: 3, workspace: "Personal", color: "#1db954", period: "monthly" },
    { id: 3, name: "Figma", logoUrl: "https://cdn.simpleicons.org/figma/FFFFFF", category: "Design", price: 15, billingDay: 29, workspace: "Work", color: "#7a4dff", period: "monthly" },
    { id: 4, name: "Notion", logoUrl: "https://cdn.simpleicons.org/notion/FFFFFF", category: "Productivity", price: 10, billingDay: 12, workspace: "Work", color: "#4a4a52", period: "monthly" },
    { id: 5, name: "iCloud+", logoUrl: "https://cdn.simpleicons.org/icloud/FFFFFF", category: "Storage", price: 2.99, billingDay: 2, workspace: "Personal", color: "#2f80ed", period: "monthly" },
    { id: 6, name: "Adobe CC", logoUrl: "https://cdn.simpleicons.org/adobe/FFFFFF", category: "Design", price: 599.88, billingDay: 16, workspace: "Work", color: "#e4000f", period: "yearly" },
    { id: 7, name: "Dropbox", logoUrl: "https://cdn.simpleicons.org/dropbox/FFFFFF", category: "Storage", price: 11.99, billingDay: 8, workspace: "Personal", color: "#0061ff", period: "monthly" },
    { id: 8, name: "Linear", logoUrl: "https://cdn.simpleicons.org/linear/FFFFFF", category: "Productivity", price: 8, billingDay: 20, workspace: "Work", color: "#5e6ad2", period: "monthly" },
  ],
};

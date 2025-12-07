import type { Metadata } from "next";
// @ts-ignore - allow importing global CSS without type declarations
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NotificationProvider } from "../components/notifications/NotificationContext";
import { ChatProvider } from "@/components/chat/ChatContext";
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "Agence Immobilière",
  description: "Application de gestion immobilière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className="antialiased"
        style={{ paddingTop: 0, fontFamily: 'system-ui, sans-serif' }} // Adjust to match your header height
      >
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              {children}
              <ChatWidget />
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

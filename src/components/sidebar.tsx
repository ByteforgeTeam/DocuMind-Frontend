"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Files, Brain, Home, PencilIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Upload Files",
    href: "/files",
    icon: Files,
  },
  {
    title: "New Chat",
    href: "/chat",
    icon: PencilIcon,
  },
];

const chatsList = [
  {
    id: "1",
    title: "How to use React hooks?",
    href: "/chat/1",
  },
  {
    id: "2",
    title: "Next.js best practices",
    href: "/chat/2",
  },
  {
    id: "3",
    title: "TypeScript tips and tricks",
    href: "/chat/3",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted/40 border-r">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Documind</h1>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h2 className="px-2 text-sm font-semibold text-muted-foreground">
            Chats
          </h2>
          <div className="space-y-1">
            {chatsList.map((chat) => {
              const isActive = pathname === chat.href;

              return (
                <Button
                  key={chat.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <Link href={chat.href}>
                    <span className="truncate">{chat.title}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

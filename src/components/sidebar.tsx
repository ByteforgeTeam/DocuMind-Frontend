"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Files,
  Brain,
  Home,
  PencilIcon,
  Trash2,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useDeleteConversation,
} from "@/hooks/useConversations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | number | null
  >(null);

  const handleDeleteClick = (conversationId: string | number) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation.mutate(conversationToDelete, {
        onSuccess: () => {
          if (pathname === `/chat/${conversationToDelete}`) {
            router.push("/chat");
          }
          setDeleteDialogOpen(false);
          setConversationToDelete(null);
        },
      });
    }
  };

  return (
    <>
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
              {isLoading ? (
                <p className="px-2 text-sm text-muted-foreground">Loading...</p>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((chat) => {
                  const isActive = pathname === `/chat/${chat.id}`;

                  return (
                    <div key={chat.id} className="relative group">
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start pr-8",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                        asChild
                      >
                        <Link href={`/chat/${chat.id}`}>
                          <span className="truncate">{chat.title}</span>
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                              isActive
                                ? "text-primary-foreground hover:bg-primary-foreground/20"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={() => handleDeleteClick(chat.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              ) : (
                <p className="px-2 text-sm text-muted-foreground">
                  No chats yet
                </p>
              )}
            </div>
          </div>
        </nav>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete this conversation? This action
              cannot be undone and all messages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

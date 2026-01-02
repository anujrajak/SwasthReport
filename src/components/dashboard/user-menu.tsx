import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, User, ChevronsUpDown } from "lucide-react";
import { MdSupportAgent } from "react-icons/md";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logout } from "@/utils/auth/auth";
import { getUser, type User as FirestoreUser } from "@/utils/firestore/users";

export function UserMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.uid) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUser(firebaseUser.uid);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.photoURL || "https://github.com/shadcn.png"}
                  alt={user?.displayName || "User"}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {loading ? "Loading..." : user?.displayName || "User"}
                </span>
                <span className="truncate text-xs">
                  {user?.email || "user@example.com"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[var(--icon-inactive)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg z-[100]"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.photoURL || "https://github.com/shadcn.png"}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.displayName || "User"}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || "user@example.com"}
                  </span>
                  {user?.phone && (
                    <span className="truncate text-xs text-muted-foreground">
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/lab-details")}>
              <User className="text-[var(--icon-active)]" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/support")}>
              <MdSupportAgent className="text-[var(--icon-active)]" />
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="text-[var(--icon-active)]" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

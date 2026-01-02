import { useLocation, useNavigate, Link } from "react-router-dom";
import { forwardRef } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { menuItems } from "@/lib/constants/menu-items";
import { cn } from "@/lib/utils";

// Create a forwardRef wrapper for Link to work with asChild
const SidebarLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>((props, ref) => {
  return <Link ref={ref} {...props} />;
});
SidebarLink.displayName = "SidebarLink";

export function SidebarNavigation() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                >
                  <SidebarLink
                    to={item.url}
                    className="flex items-center gap-2 w-full"
                  >
                    <item.icon 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-[var(--icon-active)]" : "text-[var(--icon-inactive)]"
                      )}
                    />
                  <span>{item.title}</span>
                  </SidebarLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}




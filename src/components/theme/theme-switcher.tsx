import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/hooks/useTheme";
import { themeNames, themes, type Theme } from "@/lib/constants/themes";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { colorTheme, setTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4 text-[var(--icon-active)]" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeNames.map((theme) => {
          const themeConfig = themes[theme];
          const isActive = colorTheme === theme;
          
          return (
            <DropdownMenuItem
              key={theme}
              onClick={() => setTheme(theme)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full border-2 border-border"
                  style={{
                    backgroundColor: themeConfig.colors.light.primary,
                  }}
                />
                <span>{themeConfig.name}</span>
              </div>
              {isActive && <Check className="h-4 w-4 text-[var(--icon-active)]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


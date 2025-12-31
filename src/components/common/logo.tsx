import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Logo({
  className,
  size = "md",
  showText = false,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          sizeClasses[size]
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8"
          )}
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold",
            size === "sm"
              ? "text-sm"
              : size === "md"
              ? "text-base"
              : "text-lg",
            textClassName
          )}
        >
          Swasth Report
        </span>
      )}
    </div>
  );
}


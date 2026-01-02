"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, User } from "lucide-react";
import { MdSupportAgent } from "react-icons/md";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";
import { searchPatients, type PatientWithId } from "@/utils/firestore/patients";
import { toTitleCase } from "@/lib/utils";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user: firebaseUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<PatientWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim() || !firebaseUser?.uid) {
      setPatients([]);
      setLoading(false);
      setIsDebouncing(false);
      return;
    }

    // Show loading state immediately when user types
    setIsDebouncing(true);
    setLoading(true);

    // Debounce search for 2 seconds
    searchTimeoutRef.current = setTimeout(async () => {
      setIsDebouncing(false);
      try {
        console.log("Searching for:", searchTerm);
        const results = await searchPatients(firebaseUser.uid, searchTerm);
        console.log("Search results:", results);
        setPatients(results);
      } catch (error) {
        console.error("Failed to search patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }, 2000);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, firebaseUser?.uid]);

  const handleSelect = (patient: PatientWithId) => {
    setOpen(false);
    setSearchTerm("");
    setPatients([]);
    navigate(`/dashboard/patients/${patient.id}/reports`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
      setPatients([]);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border" />
      </div>
      <div className="relative flex-1 md:max-w-sm">
        <Popover open={open} onOpenChange={setOpen}>
          <div className="relative">
            <Search className="text-[var(--icon-inactive)] pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 z-10" />
            <PopoverAnchor asChild>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="h-9 w-full bg-background pl-8 w-[400px]"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (searchTerm.trim()) {
                      setOpen(true);
                    }
                  }}
                />
              </div>
            </PopoverAnchor>
          </div>
          <PopoverContent 
            className="w-[400px] p-0" 
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                {(loading || isDebouncing) ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {isDebouncing ? "Searching..." : "Loading results..."}
                    </span>
                  </div>
                ) : patients.length === 0 && searchTerm.trim() ? (
                  <CommandEmpty>No patients found.</CommandEmpty>
                ) : patients.length > 0 ? (
                  <CommandGroup heading="Patients">
                    {patients.slice(0, 10).map((patient) => (
                      <CommandItem
                        key={patient.id}
                        value={patient.id}
                        onSelect={() => handleSelect(patient)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-[var(--icon-inactive)] shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {patient.title ? `${patient.title} ` : ""}
                            {toTitleCase(patient.name)}
                          </span>
                          {patient.phone && (
                            <span className="text-xs text-muted-foreground truncate">
                              {patient.phone}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {patients.length > 10 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground text-center border-t">
                        Showing first 10 of {patients.length} results
                      </div>
                    )}
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/support")}
          className="gap-2"
        >
          <MdSupportAgent className="h-4 w-4 text-[var(--icon-active)]" />
          <span className="hidden sm:inline">Support</span>
        </Button>
      </div>
    </header>
  );
}




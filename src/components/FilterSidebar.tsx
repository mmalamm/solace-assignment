"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useAdvocateSearch } from "@/hooks/useAdvocateSearch";
import { SPECIALTIES, DEGREES } from "@/lib/constants";

interface FilterSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mobile?: boolean;
}

export default function FilterSidebar({
  open,
  onOpenChange,
  mobile,
}: FilterSidebarProps) {
  const { filters, updateFilters, clearFilters } = useAdvocateSearch();

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    filters.specialties
  );
  const [selectedDegree, setSelectedDegree] = useState(filters.degree);
  const [minExperience, setMinExperience] = useState(filters.minExperience);

  // Sync local state with URL params
  useEffect(() => {
    setSearchTerm(filters.search);
    setSelectedSpecialties(filters.specialties);
    setSelectedDegree(filters.degree);
    setMinExperience(filters.minExperience);
  }, [filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      search: searchTerm,
      specialties: selectedSpecialties,
      degree: selectedDegree,
      minExperience,
      page: 1, // Reset to page 1 on filter change
    });
    // Close mobile sidebar after submit
    if (mobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedSpecialties([]);
    setSelectedDegree("");
    setMinExperience(0);
    clearFilters();
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const FilterForm = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search">Search by Name or City</Label>
        <Input
          id="search"
          type="text"
          placeholder="Enter name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Specialties Multi-Select */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <Label>Specialties</Label>
          <span className="text-xs text-muted-foreground">
            (shows advocates with any selected specialty)
          </span>
        </div>
        <ScrollArea className="h-48 border rounded-md p-4">
          <div className="space-y-3">
            {SPECIALTIES.map((specialty) => (
              <div key={specialty} className="flex items-start space-x-2">
                <Checkbox
                  id={`specialty-${specialty}`}
                  checked={selectedSpecialties.includes(specialty)}
                  onCheckedChange={() => toggleSpecialty(specialty)}
                />
                <Label
                  htmlFor={`specialty-${specialty}`}
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedSpecialties.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedSpecialties.length} selected
          </p>
        )}
      </div>

      {/* Degree Radio Group */}
      <div className="space-y-3">
        <Label>Degree</Label>
        <RadioGroup value={selectedDegree} onValueChange={setSelectedDegree}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="degree-any" />
            <Label htmlFor="degree-any" className="font-normal cursor-pointer">
              Any
            </Label>
          </div>
          {DEGREES.map((degree) => (
            <div key={degree} className="flex items-center space-x-2">
              <RadioGroupItem value={degree} id={`degree-${degree}`} />
              <Label
                htmlFor={`degree-${degree}`}
                className="font-normal cursor-pointer"
              >
                {degree}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Years of Experience Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Minimum Years of Experience</Label>
          <span className="text-sm font-medium">{minExperience}+ years</span>
        </div>
        <Slider
          value={[minExperience]}
          onValueChange={(value) => setMinExperience(value[0])}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  );

  // Mobile version (Sheet)
  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-80 flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-6 pr-6 -mr-6">
            {FilterForm}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version (Fixed Sidebar)
  return (
    <div className="w-80 shrink-0 border-r bg-background/95 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      {FilterForm}
    </div>
  );
}

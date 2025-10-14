"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Phone, MapPin, Briefcase } from "lucide-react";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

interface ProfileDialogProps {
  advocate: Advocate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({
  advocate,
  open,
  onOpenChange,
}: ProfileDialogProps) {
  if (!advocate) return null;

  const formattedPhone = advocate.phoneNumber
    .toString()
    .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {advocate.firstName} {advocate.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Header info */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-base px-3 py-1">
              {advocate.degree}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{advocate.city}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{advocate.yearsOfExperience} years experience</span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${advocate.phoneNumber}`}
              className="text-primary hover:underline"
            >
              {formattedPhone}
            </a>
          </div>

          {/* Specialties */}
          <div className="space-y-3">
            <h3 className="font-semibold">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {advocate.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

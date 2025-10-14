"use client";

import { useState } from "react";
import { useAdvocateSearch } from "@/hooks/useAdvocateSearch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import ProfileDialog from "./ProfileDialog";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: string;
}

export default function ResultsGrid() {
  const { data, pagination, loading, error, updateFilters } =
    useAdvocateSearch();
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(
    null
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <h3 className="font-semibold text-destructive">
          Error loading advocates
        </h3>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="font-semibold text-lg">No advocates found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  const startResult = (pagination.page - 1) * pagination.limit + 1;
  const endResult = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startResult}-{endResult} of {pagination.total} results
        </p>
        <Select
          value={pagination.limit.toString()}
          onValueChange={(value) =>
            updateFilters({ limit: parseInt(value), page: 1 })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advocate Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {data.map((advocate) => (
          <Card key={advocate.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span>
                  {advocate.firstName} {advocate.lastName}
                </span>
                <Badge variant="outline">{advocate.degree}</Badge>
              </CardTitle>
              <CardDescription>
                {advocate.city} • {advocate.yearsOfExperience} years
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {advocate.specialties.slice(0, 3).map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="text-xs"
                  >
                    {specialty}
                  </Badge>
                ))}
                {advocate.specialties.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{advocate.specialties.length - 3} more
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => setSelectedAdvocate(advocate)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => updateFilters({ page: pagination.page - 1 })}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={
                      pagination.page === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => updateFilters({ page: pageNum })}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => updateFilters({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Profile Dialog */}
      <ProfileDialog
        advocate={selectedAdvocate}
        open={!!selectedAdvocate}
        onOpenChange={(open) => !open && setSelectedAdvocate(null)}
      />
    </div>
  );
}

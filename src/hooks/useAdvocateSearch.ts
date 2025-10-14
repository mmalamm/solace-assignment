"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchResponse {
  data: Advocate[];
  pagination: Pagination;
}

export function useAdvocateSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<Advocate[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable URL string that only changes when actual params change
  const urlParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  // Read filters from URL - these are for display only
  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      specialties:
        searchParams.get("specialties")?.split(",").filter(Boolean) || [],
      degree: searchParams.get("degree") || "",
      minExperience: parseInt(searchParams.get("minExperience") || "0"),
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "25"),
    }),
    [searchParams]
  );

  // Fetch data when URL params change
  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = urlParamsString
          ? `/api/advocates?${urlParamsString}`
          : "/api/advocates";

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch advocates");

        const json: SearchResponse = await response.json();
        setData(json.data);
        setPagination(json.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, [urlParamsString]); // Only re-fetch when the URL string actually changes

  // Update URL (which will trigger re-fetch via useEffect)
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        value === "" ||
        value === 0 ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/");
  };

  return {
    data,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
  };
}

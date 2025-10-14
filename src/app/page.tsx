"use client";

import { Suspense, useState } from "react";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import ResultsGrid from "@/components/ResultsGrid";
import Footer from "@/components/Footer";

function SearchContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="container flex-1">
        <div className="flex gap-6 py-6">
          {/* Desktop sidebar - always visible on md+ screens */}
          <aside className="hidden md:block">
            <FilterSidebar />
          </aside>

          {/* Mobile sidebar - Sheet overlay */}
          <FilterSidebar
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            mobile
          />

          {/* Results */}
          <main className="flex-1 min-w-0">
            <ResultsGrid />
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}

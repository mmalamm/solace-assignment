# Frontend Implementation Plan

A complete guide to building the Solace Advocates search interface with shadcn/ui components.

---

## Overview

**Tech Stack:**

- Next.js 14 (App Router)
- React 18
- shadcn/ui components
- Tailwind CSS
- URL-based state management (no external library needed!)

**Architecture:**

- 4 main components: `Header`, `FilterSidebar`, `ResultsGrid`, `Footer`
- URL search params for state management (shareable links, browser back/forward)
- Server-side API calls from client components

---

## State Management Strategy

### ✅ Recommended: URL Search Params (Built-in)

**Why this is the best choice for this app:**

- ✅ **Zero dependencies** - Built into Next.js
- ✅ **Shareable URLs** - Users can bookmark/share filtered searches
- ✅ **Browser history** - Back/forward buttons work naturally
- ✅ **Simple to understand** - Just read/write URL params
- ✅ **No cache invalidation** - Always fresh data on filter change
- ✅ **SEO friendly** - Search engines can crawl filtered pages

**When you DON'T need React Query/TanStack Query:**

- Search results change frequently (no aggressive caching needed)
- Simple one-endpoint API (not complex data relationships)
- No optimistic updates or mutations
- No background refetching needed

**Implementation:**

```typescript
// Custom hook: useAdvocateSearch.ts
const [searchParams, setSearchParams] = useSearchParams();

// Read state from URL
const filters = {
  search: searchParams.get("search") || "",
  specialties: searchParams.get("specialties")?.split(",") || [],
  degree: searchParams.get("degree") || "",
  minExperience: parseInt(searchParams.get("minExperience") || "0"),
  page: parseInt(searchParams.get("page") || "1"),
  limit: parseInt(searchParams.get("limit") || "25"),
};

// Update URL when filters change
const updateFilters = (newFilters) => {
  const params = new URLSearchParams();
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  setSearchParams(params);
};
```

### Alternative: React Context (if you prefer)

Only use if you explicitly DON'T want URL state. Simpler but loses shareable URLs.

---

## Setup: Install shadcn/ui

### 1. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Configuration prompts:**

- Style: `Default`
- Base color: `Neutral` (we'll customize to Solace teal)
- CSS variables: `Yes`

This creates:

- `components/ui/` - shadcn components
- `lib/utils.ts` - cn() utility
- Updates `tailwind.config.js`

### 2. Customize for Solace Brand

**Update `tailwind.config.js`:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2e7a66", // Solace teal
          50: "#f0f9f6",
          100: "#d9f0e9",
          200: "#b3e0d3",
          300: "#8dd1bd",
          400: "#5bb89d",
          500: "#2e7a66", // Base
          600: "#256150",
          700: "#1c493c",
          800: "#133128",
          900: "#0a1814",
        },
      },
      fontFamily: {
        sans: ["Lato", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
};
```

**Update `app/globals.css` with Solace brand colors:**

```css
@layer base {
  :root {
    --primary: 166 45% 33%; /* #2e7a66 - Solace teal */
    --primary-foreground: 0 0% 100%;

    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 166 35% 95%; /* Light teal accent */
    --accent-foreground: 166 45% 20%;

    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}
```

**Install Lato font** (add to `app/layout.tsx`):

```tsx
import { Lato } from "next/font/google";

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lato.className}>
      {children}
    </html>
  );
}
```

### 3. Install required components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add sheet
npx shadcn@latest add select
npx shadcn@latest add slider
npx shadcn@latest add radio-group
npx shadcn@latest add checkbox
npx shadcn@latest add separator
```

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main page (layout orchestration)
│   └── api/advocates/route.ts      # ✅ Already implemented
├── components/
│   ├── Header.tsx                  # Logo + mobile menu toggle
│   ├── FilterSidebar.tsx           # Search/filter form
│   ├── ResultsGrid.tsx             # Advocate cards + pagination
│   ├── Footer.tsx                  # Static footer
│   └── ui/                         # shadcn components (auto-generated)
├── hooks/
│   └── useAdvocateSearch.ts        # Custom hook for state + API calls
└── lib/
    └── utils.ts                    # ✅ Generated by shadcn
```

---

## Component Specifications

### 1. Header Component

**File:** `src/components/Header.tsx`

**Features:**

- Solace logo (left side)
- Mobile menu toggle button (right side, only visible on small screens)
- Sticky positioning
- Clean, minimal design

**shadcn components:** `Button`, `Sheet` (for mobile sidebar trigger)

**Key behaviors:**

- Desktop (≥ 768px): Only shows logo
- Mobile (< 768px): Shows logo + hamburger menu button

**Example structure:**

```tsx
<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
  <div className="container flex h-16 items-center justify-between">
    <Image src="/solace.svg" alt="Solace" width={120} height={40} />

    {/* Mobile menu button - only visible on small screens */}
    <Button variant="ghost" size="icon" className="md:hidden">
      <MenuIcon />
    </Button>
  </div>
</header>
```

---

### 2. FilterSidebar Component

**File:** `src/components/FilterSidebar.tsx`

**Features:**

- Sidebar layout (left side on desktop, overlay on mobile)
- Search input (name or city)
- Multi-select for specialties
- Radio group for degree (PhD, MD, MSW, or "Any")
- Slider for minimum years of experience (0-30 range)
- Submit button
- Clear filters button

**shadcn components:**

- `Sheet` (mobile sidebar)
- `Input` (search)
- `Checkbox` (multi-select specialties)
- `RadioGroup` (degree)
- `Slider` (years of experience)
- `Button` (submit/clear)
- `ScrollArea` (scrollable specialties list)

**Responsive behavior:**

- Desktop: Fixed sidebar, always visible (w-80, left side)
- Mobile: Sheet overlay, toggles in from left, covers results

**Specialties list (from seed data):**

```typescript
const SPECIALTIES = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health (anxiety, depression, stress, grief, life transitions)",
  "Men's issues",
  "Relationship Issues (family, friends, couple, etc)",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues (post-partum, infertility, family planning)",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching (leadership, career, academic and wellness)",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations & testing (ADHD testing)",
  "Attention and Hyperactivity (ADHD)",
  "Sleep issues",
  "Schizophrenia and psychotic disorders",
  "Learning disorders",
  "Domestic abuse",
];

const DEGREES = ["PhD", "MD", "MSW"];
```

**State management:**

```tsx
// Read from URL params
const filters = useAdvocateFilters();

// Update URL on form submit
const handleSubmit = (e) => {
  e.preventDefault();
  updateFilters({
    search: searchValue,
    specialties: selectedSpecialties.join(","),
    degree: selectedDegree,
    minExperience: minYearsValue,
    page: 1, // Reset to page 1 on new search
  });
};
```

---

### 3. ResultsGrid Component

**File:** `src/components/ResultsGrid.tsx`

**Features:**

- Loading state
- Empty state (no results found)
- Grid of advocate cards
- Pagination controls
- Results per page selector (10, 25, 100)

**shadcn components:**

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Badge` (for specialties)
- `Button` (pagination)
- `Select` (results per page)

**Layout:**

- Desktop: 2-3 columns grid
- Mobile: Single column

**Advocate Card Structure:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>
      {firstName} {lastName}, {degree}
    </CardTitle>
    <CardDescription>
      {city} • {yearsOfExperience} years
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2">
      {specialties.map((s) => (
        <Badge key={s} variant="secondary">
          {s}
        </Badge>
      ))}
    </div>
    <Button variant="outline" className="w-full mt-4">
      View Profile
    </Button>
  </CardContent>
</Card>
```

**Pagination:**

```tsx
<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    Showing {start}-{end} of {total} results
  </p>

  <div className="flex gap-2">
    <Button
      variant="outline"
      disabled={page === 1}
      onClick={() => updateFilters({ page: page - 1 })}
    >
      Previous
    </Button>

    <Button
      variant="outline"
      disabled={page === totalPages}
      onClick={() => updateFilters({ page: page + 1 })}
    >
      Next
    </Button>
  </div>

  <Select
    value={limit}
    onValueChange={(v) => updateFilters({ limit: v, page: 1 })}
  >
    <SelectTrigger className="w-[120px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 / page</SelectItem>
      <SelectItem value="25">25 / page</SelectItem>
      <SelectItem value="100">100 / page</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

### 4. Footer Component

**File:** `src/components/Footer.tsx`

**Features:**

- Simple, clean design
- Company info
- Links (Privacy, Terms, Contact)
- Copyright

**Example:**

```tsx
<footer className="border-t bg-muted/50">
  <div className="container py-6">
    <p className="text-center text-sm text-muted-foreground">
      © 2025 Solace. All rights reserved.
    </p>
  </div>
</footer>
```

---

## Custom Hook: useAdvocateSearch

**File:** `src/hooks/useAdvocateSearch.ts`

This hook manages all state and API interactions.

```typescript
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

  // IMPORTANT: Create stable URL string to avoid infinite loops
  // searchParams object changes reference on every render, so we memoize the string
  const urlParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  // Read filters from URL - memoized to avoid recreating on every render
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

  // Update URL (triggers re-fetch via useEffect)
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
```

---

## Main Page Layout

**File:** `src/app/page.tsx`

```tsx
"use client";

import { Suspense } from "react";
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
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-80 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Mobile sidebar (Sheet) */}
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
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
```

---

## Responsive Breakpoints

```css
/* Tailwind breakpoints used */
sm: 640px   /* Small devices */
md: 768px   /* Tablets - sidebar becomes persistent */
lg: 1024px  /* Desktop - 3 column grid */
xl: 1280px  /* Large desktop */
```

**Behavior:**

- **Mobile (< 768px)**:

  - Sidebar hidden, accessible via Sheet overlay
  - Single column results
  - Header shows menu button

- **Desktop (≥ 768px)**:
  - Sidebar always visible (left side)
  - 2-3 column results grid
  - Header only shows logo

---

## Implementation Checklist

### Phase 1: Setup

- [ ] Initialize shadcn/ui: `npx shadcn@latest init`
- [ ] Install components (button, input, card, etc.)
- [ ] Verify Tailwind config updated

### Phase 2: Core Components

- [ ] Create `useAdvocateSearch` hook
- [ ] Build `Header` component
- [ ] Build `Footer` component

### Phase 3: Filter Sidebar

- [ ] Create `FilterSidebar` component structure
- [ ] Add search input
- [ ] Add specialty multi-select (checkboxes in ScrollArea)
- [ ] Add degree radio group
- [ ] Add years of experience slider
- [ ] Wire up form submission to `updateFilters`
- [ ] Implement mobile Sheet behavior

### Phase 4: Results Grid

- [ ] Create `ResultsGrid` component
- [ ] Build advocate card layout
- [ ] Add loading skeleton
- [ ] Add empty state
- [ ] Implement pagination controls
- [ ] Add results-per-page selector

### Phase 5: Integration

- [ ] Update `src/app/page.tsx` with layout
- [ ] Test responsive behavior
- [ ] Test URL state persistence (reload, back/forward)
- [ ] Test all filters work correctly

### Phase 6: Polish

- [ ] Add loading states
- [ ] Add error handling
- [ ] Verify accessibility (keyboard navigation, ARIA labels)
- [ ] Test on mobile devices
- [ ] Add animations/transitions (optional)

---

## Testing the Frontend

### Manual Testing Checklist

**Filters:**

- [ ] Search by name returns correct results
- [ ] Search by city returns correct results
- [ ] Multi-select specialties works (select multiple)
- [ ] Degree filter works (PhD, MD, MSW)
- [ ] Years of experience slider works
- [ ] Combined filters work together
- [ ] Clear filters resets everything

**Pagination:**

- [ ] Next/Previous buttons work
- [ ] Results per page (10, 25, 100) works
- [ ] Page resets to 1 when filters change

**Responsive:**

- [ ] Mobile: Sidebar toggles with menu button
- [ ] Mobile: Results show by default
- [ ] Desktop: Sidebar always visible
- [ ] Desktop: Multi-column grid works
- [ ] All screen sizes look good

**URL State:**

- [ ] Filters reflected in URL
- [ ] Reload page preserves filters
- [ ] Browser back/forward works
- [ ] Shareable URLs work (copy/paste)

---

## Why This Approach?

### URL State vs React Query vs Context

**URL State (Recommended):**

```tsx
// Pros:
✅ Zero dependencies
✅ Shareable URLs
✅ Browser history support
✅ Simple mental model
✅ Always in sync

// Cons:
❌ More URL manipulation code
❌ No caching (but not needed here)
```

**React Query (Overkill for this app):**

```tsx
// Good for:
✓ Complex data dependencies
✓ Aggressive caching needs
✓ Optimistic updates
✓ Background refetching

// Not needed here:
✗ Single endpoint
✗ No mutations
✗ Simple search use case
```

**React Context (Alternative):**

```tsx
// Good for:
✓ Simple state sharing
✓ No URL pollution

// Loses:
✗ Shareable URLs
✗ Browser history
✗ Reload persistence
```

---

## View Profile Functionality

### Implementation: Dialog/Modal Pattern

**Component:** `src/components/ProfileDialog.tsx`

**Why Dialog:**

- Keeps search context (filters, scroll position preserved)
- Natural "back" navigation (click outside or X button)
- Best mobile + desktop experience
- No URL management needed
- Accessible out of the box

**Data displayed:**

- Full name with degree badge
- City and years of experience
- Phone number (formatted, clickable)
- All specialties (not truncated)

**Full Implementation:**

```tsx
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
```

**Usage in ResultsGrid.tsx:**

Add state at top of component:

```tsx
const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
```

Update "View Profile" button in card:

```tsx
<Button
  variant="outline"
  className="w-full"
  size="sm"
  onClick={() => setSelectedAdvocate(advocate)}
>
  View Profile
</Button>
```

Add dialog at end of component (after pagination):

```tsx
<ProfileDialog
  advocate={selectedAdvocate}
  open={!!selectedAdvocate}
  onOpenChange={(open) => !open && setSelectedAdvocate(null)}
/>
```

---

## Next Steps After Implementation

1. **Accessibility audit** - Test with screen readers
2. **Performance optimization** - Add loading skeletons, optimize images
3. **Analytics** - Track popular searches/filters
4. **Enhanced features** - Saved searches, favorites, etc.

---

## Common Issues & Solutions

### Issue: "use client" errors

**Solution:** Add `'use client'` directive to components using hooks

### Issue: Hydration mismatch

**Solution:** Wrap page in `<Suspense>` for searchParams

### Issue: Sidebar not hiding on mobile

**Solution:** Check Sheet `open` prop wired to state correctly

### Issue: URL not updating

**Solution:** Use `router.push()`, not `router.replace()`

### Issue: Filters not persisting on reload

**Solution:** Ensure reading from `searchParams`, not local state

### Issue: Maximum update depth exceeded / Infinite loop

**Problem:** The `searchParams` object from Next.js changes reference on every render, even if values haven't changed

**Solution:** Use `useMemo` to create stable dependencies:

```typescript
// ❌ WRONG - causes infinite loop
useEffect(() => {
  fetch(/* ... */);
}, [searchParams]); // searchParams object changes every render

// ✅ CORRECT - stable string dependency
const urlParamsString = useMemo(() => searchParams.toString(), [searchParams]);
useEffect(() => {
  fetch(/* ... */);
}, [urlParamsString]); // string only changes when actual params change
```

**Key principles:**

- Always memoize values derived from `searchParams`
- Use `searchParams.toString()` as the dependency, not `searchParams` object
- Memoize `filters` object to prevent unnecessary re-renders in consuming components

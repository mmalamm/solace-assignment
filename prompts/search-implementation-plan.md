# API Route Implementation Plan

## Current State

### Database Schema

✅ **Well-structured** - [src/db/schema.ts](../src/db/schema.ts) supports all required features:

- `firstName`, `lastName` - for name search (has indices)
- `city` - for city search (has index)
- `specialties` - JSONB array with GIN index (perfect for array filtering)
- `degree` - text field (can filter exactly)
- `yearsOfExperience` - integer (can filter with >= comparison)

### Current Route

❌ **No filtering** - [src/app/api/advocates/route.ts](../src/app/api/advocates/route.ts) currently:

- Simple `db.select().from(advocates).limit(100)`
- No query parameter handling
- No pagination metadata

---

## Solution: Database-side Filtering

Move filtering to the database for:

- **Performance**: Only transfer needed data
- **Scalability**: Handle thousands of records
- **Case-insensitive search**: Use SQL `ILIKE`
- **Pagination**: Built-in `LIMIT`/`OFFSET`

### API Changes Required

#### 1. Update GET `/api/advocates/route.ts`

**Accept Query Parameters:**

```typescript
?search=john              // Search name or city
&specialties=trauma,grief // Comma-separated specialties
&degree=PhD               // Exact degree match
&minExperience=5          // Minimum years
&page=1                   // Page number (1-indexed)
&limit=25                 // Results per page (10, 25, or 100)
```

**Return Format:**

```typescript
{
  data: Advocate[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 2. Implementation Steps

**Step 1: Extract query parameters**

```typescript
const url = new URL(request.url);
const search = url.searchParams.get("search") || "";
const specialties =
  url.searchParams.get("specialties")?.split(",").filter(Boolean) || [];
const degree = url.searchParams.get("degree") || "";
const minExperience = parseInt(url.searchParams.get("minExperience") || "0");
const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
const limit = [10, 25, 100].includes(
  parseInt(url.searchParams.get("limit") || "25")
)
  ? parseInt(url.searchParams.get("limit") || "25")
  : 25;
```

**Step 2: Build Drizzle query with filters**

```typescript
import { and, or, ilike, gte, sql } from "drizzle-orm";

let conditions = [];

// Name or city search (case-insensitive)
if (search) {
  conditions.push(
    or(
      ilike(advocates.firstName, `%${search}%`),
      ilike(advocates.lastName, `%${search}%`),
      ilike(advocates.city, `%${search}%`)
    )
  );
}

// Specialties filter (JSONB array contains check)
if (specialties.length > 0) {
  conditions.push(
    sql`${advocates.specialties} ?| array[${specialties.join(",")}]`
  );
}

// Degree filter (exact match, case-insensitive)
if (degree) {
  conditions.push(ilike(advocates.degree, degree));
}

// Years of experience filter (>=)
if (minExperience > 0) {
  conditions.push(gte(advocates.yearsOfExperience, minExperience));
}
```

**Step 3: Execute query with pagination**

```typescript
const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

// Get total count for pagination
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(advocates)
  .where(whereClause);

// Get paginated results
const data = await db
  .select()
  .from(advocates)
  .where(whereClause)
  .limit(limit)
  .offset((page - 1) * limit);

return Response.json({
  data,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  },
});
```

---

## Index Strategy

Your current indices are now optimal:

- ✅ `idx_advocates_first_name` - B-tree index for name search
- ✅ `idx_advocates_last_name` - B-tree index for name search
- ✅ `idx_advocates_city` - B-tree index for city search
- ✅ `idx_advocates_specialties` - GIN index for JSONB array operations

**Optional**: If you search by degree frequently, add:

```typescript
degreeIdx: index("idx_advocates_degree").on(table.degree);
```

**Optional**: If you filter by experience frequently, add:

```typescript
experienceIdx: index("idx_advocates_years_of_experience").on(
  table.yearsOfExperience
);
```

---

## Implementation Steps

1. ✅ **Database indices** - Already added
2. **Update API route** - Add query parameter handling and filtering logic
3. **Test with manual API calls** - Verify queries work correctly

---

## Query Performance Notes

- The `ILIKE` operator with `%` on both sides can't use indices efficiently for very large tables
- For production at scale (10k+ records), consider adding full-text search with `tsvector` columns
- The GIN index on specialties is perfect for the `?|` (overlaps) operator
- Pagination with `LIMIT`/`OFFSET` is fine for thousands of records; for millions consider cursor-based pagination

---

## Example API Call

```
GET /api/advocates?search=john&specialties=trauma,grief&degree=PhD&minExperience=5&page=1&limit=25
```

Response:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 156,
    "totalPages": 7
  }
}
```

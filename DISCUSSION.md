## tldr;

Built a searchable advocate directory with filtering capabilities. The implementation covers seeding a larger dataset, creating database indices for performance, building out an API with pagination and multi-criteria filtering (name/city search, specialties, degree, years of experience), and a clean frontend with a responsive filter sidebar and results grid. Everything's working well for an MVP, and I'm keeping next iterations focused on user feedback before adding bells and whistles.

## Plan

- seed database with more records for better querying/filtering/pagination demo
  - create indices on fields for more performant searching/querying
- flesh out API route to accept searching/filtering functionality
  - paginate records (thousands potentially)
  - searching/filtering
    - earch by name/city
    - filter by specialties
    - filter by degree
    - filter by years of exp
- build out UI form with results and filtering

## Implementation

Started by expanding the seed data to 1000+ advocates using faker to generate realistic profiles. Added database indices on all searchable/filterable fields (name, city, degree, years of experience) with a GIN index on the specialties JSONB array for efficient array containment queries.

Rewrote the advocates API route to handle query parameters for search, filtering, and pagination. The search covers first name, last name, and city using case-insensitive pattern matching. Filtering supports multiple specialties (any match), exact degree matching, and minimum years of experience. Pagination defaults to 25 results per page with support for 10/25/100 page sizes. The API returns both the data and pagination metadata (total count, current page, total pages).

For the frontend, set up shadcn/ui components and Tailwind for styling. Created a FilterSidebar component that handles all the filter controls (search input, specialty checkboxes, degree select, experience slider) with a mobile-responsive sheet drawer. Built a ResultsGrid component that displays advocate cards with their key info and a profile dialog for full details. Added a custom useAdvocateSearch hook to manage all the search state, URL params, and API calls with debouncing on the search input. The main page ties everything together with a clean two-column layout (sidebar + results) that works on mobile and desktop.

## Next Steps

While I would love to implement ui niceties such as dark mode, infinite scroll, additional filtering options etc, I would love to get the current iteration in front of users and identify pain points or suggestions to inform the roadmap before committing time to new development

# UI Polish Plan

## Issues Identified

### 1. Desktop View Not Centered

**Problem:** Content is not centered horizontally on desktop, making the layout appear left-aligned on wide screens.

**Root cause:** Tailwind's `container` class by default uses `width: 100%` at breakpoints and adds `max-width` constraints, but doesn't automatically center with `margin: auto`.

**Solution:** Configure Tailwind's container to center by default by adding `center: true` to the theme configuration.

**Files to modify:**

- `tailwind.config.ts`

**Changes:**

```typescript
theme: {
  container: {
    center: true,
    padding: '2rem',
  },
  extend: {
    // ... existing extended config
  }
}
```

### 2. Zero Padding Causing Edge Collision

**Problem:** Components touch the edge of the viewport on mobile/small screens, creating a cramped feel and poor touch targets.

**Root cause:** The `container` class has no default padding, and the `py-6` on the flex container only adds vertical padding.

**Solution:** Add horizontal padding to the container configuration (included in fix #1 above), and ensure proper spacing on mobile views.

**Additional changes needed:**

- Add responsive padding to Header's container
- Ensure FilterSidebar Sheet has proper padding (already has it)
- Verify ResultsGrid cards have proper spacing

**Files to modify:**

- `tailwind.config.ts` (padding in container config)
- `src/app/page.tsx` (adjust container usage)
- `src/components/Header.tsx` (ensure padding in header container)

### 3. Mobile Sidebar Doesn't Scroll (Submit Button Hidden)

**Problem:** On mobile devices with small screens, the FilterSidebar Sheet content is taller than the viewport, but the submit button at the bottom is not accessible because the Sheet content doesn't scroll.

**Root cause:** The SheetContent component needs an explicit scrollable area. Currently the form is rendered directly inside `<SheetContent>` without a scrollable wrapper.

**Solution:** Wrap the FilterSidebar form content in a scrollable container within the Sheet. The shadcn/ui Sheet component should have `overflow-auto` on its content area.

**Files to modify:**

- `src/components/FilterSidebar.tsx`

**Changes to mobile Sheet section:**

```tsx
// BEFORE (lines 191-204):
if (mobile) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">{FilterForm}</div>
      </SheetContent>
    </Sheet>
  );
}

// AFTER:
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
```

**Explanation:**

- `flex flex-col` on SheetContent: Makes header and content stack vertically
- `shrink-0` on SheetHeader: Prevents header from shrinking
- `flex-1 overflow-y-auto` on form wrapper: Allows form to scroll while header stays fixed
- `pr-6 -mr-6`: Adds right padding while extending to edge (compensates for scrollbar appearance)

## Implementation Order

1. **Fix #1 & #2 together** - Configure Tailwind container (centers layout and adds padding)
2. **Fix #3** - Update mobile FilterSidebar scrolling
3. **Verification pass** - Test on various screen sizes

## Detailed Implementation Steps

### Step 1: Configure Tailwind Container

**File:** `tailwind.config.ts`

Add container configuration to the theme:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      // ... existing config (backgroundImage, fontFamily, borderRadius, colors)
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

**What this does:**

- `center: true` - Adds `margin-left: auto; margin-right: auto` to center container
- `padding` object - Responsive padding at different breakpoints:
  - Mobile: 1rem (16px) on each side
  - Small screens (640px+): 1.5rem (24px) on each side
  - Large screens (1024px+): 2rem (32px) on each side

### Step 2: Adjust Page Layout

**File:** `src/app/page.tsx`

The current `py-6` only adds vertical padding. With container padding now configured, we may want to reduce the vertical spacing slightly:

```tsx
// CURRENT (line 16-17):
<div className="container flex-1">
  <div className="flex gap-6 py-6">

// RECOMMENDED:
<div className="container flex-1">
  <div className="flex gap-6 py-6">
```

Actually, the current implementation is fine. The container padding will handle horizontal spacing, and `py-6` provides good vertical rhythm.

**No changes needed to page.tsx** - the container padding will automatically apply.

### Step 3: Fix Mobile Sidebar Scrolling

**File:** `src/components/FilterSidebar.tsx`

Update the mobile Sheet section (lines 191-204):

```tsx
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
```

### Step 4: Optional - Header Padding Adjustment

**File:** `src/components/Header.tsx`

The Header already uses `container` class (line 11), so it will automatically get the centered layout and padding from the Tailwind config.

**No changes needed** - the container configuration will apply automatically.

## Testing Checklist

After implementing the fixes, test the following:

### Desktop (≥768px)

- [ ] Content is centered horizontally on the page
- [ ] There is adequate padding/margin on left and right edges
- [ ] Sidebar and results grid have proper spacing between them
- [ ] Header logo and content are properly aligned with page content

### Tablet (640px - 767px)

- [ ] Content has adequate padding on sides
- [ ] Layout doesn't feel cramped
- [ ] Mobile menu button appears and functions correctly

### Mobile (<640px)

- [ ] Content has minimum 1rem padding on each side
- [ ] Header doesn't touch edges of screen
- [ ] When opening mobile sidebar (Sheet):
  - [ ] Header "Filters" title is visible at top
  - [ ] Form content scrolls smoothly
  - [ ] Submit button is accessible at bottom
  - [ ] All form fields are reachable
  - [ ] No content is cut off
  - [ ] Close button (X) is always visible

### Mobile - Small Screens (iPhone SE, 375px height)

- [ ] Mobile sidebar scrolls properly even on very small screens
- [ ] Submit and Clear buttons are accessible
- [ ] All specialty checkboxes are reachable by scrolling

## Summary of Changes

| Issue                             | File                               | Change                              | Lines   |
| --------------------------------- | ---------------------------------- | ----------------------------------- | ------- |
| Desktop not centered & no padding | `tailwind.config.ts`               | Add `container` theme config        | 11-17   |
| Mobile sidebar not scrollable     | `src/components/FilterSidebar.tsx` | Add flex layout and overflow-y-auto | 193-203 |

## Notes

- The Tailwind container configuration is global and will apply to all uses of the `container` class throughout the app
- The padding values (1rem, 1.5rem, 2rem) provide good touch targets on mobile and comfortable reading width on desktop
- The mobile sidebar fix uses flexbox to create a fixed header with scrollable content body
- All changes are CSS-only, no logic changes required

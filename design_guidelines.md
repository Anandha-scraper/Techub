# Student Points Management System - Design Guidelines

## Design Approach: Productivity-Focused System
**Selected Framework:** Design system approach inspired by Linear and Notion's clean, productivity-focused interfaces
**Justification:** Educational management tools require clarity, efficiency, and role-based interface differentiation. The dual-portal nature (admin/student) demands consistent patterns with clear visual hierarchy.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 234 85% 35% (Deep educational blue)
- Secondary: 234 70% 92% (Light blue for backgrounds)
- Success: 142 71% 45% (Achievement green)
- Warning: 38 92% 50% (Alert orange)
- Surface: 0 0% 98% (Clean white background)
- Text Primary: 234 15% 15% (Near black)
- Text Secondary: 234 8% 45% (Medium gray)

**Dark Mode:**
- Primary: 234 85% 65% (Brighter blue)
- Secondary: 234 30% 18% (Dark blue backgrounds)
- Success: 142 71% 55% (Lighter green)
- Warning: 38 92% 60% (Brighter orange)
- Surface: 234 15% 10% (Dark background)
- Text Primary: 0 0% 95% (Off white)
- Text Secondary: 234 5% 65% (Light gray)

**Role Identification:**
- Admin Accent: 280 65% 55% (Purple tint for admin sections)
- Student Accent: 195 75% 50% (Cyan tint for student sections)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - for UI elements, buttons, labels
- Secondary: 'JetBrains Mono' (Google Fonts) - for data points, scores, codes

**Type Scale:**
- Hero/H1: text-4xl font-bold (admin dashboard titles)
- H2: text-2xl font-semibold (section headers)
- H3: text-xl font-medium (card titles)
- Body: text-base font-normal (general content)
- Small: text-sm (metadata, captions)
- Data Display: text-lg font-mono (points, scores)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Micro spacing: gap-2, p-2 (tight elements)
- Standard spacing: p-4, gap-4, m-4 (cards, forms)
- Section spacing: py-8, px-6 (containers)
- Large separation: py-12, gap-12 (major sections)

**Grid Structure:**
- Admin Dashboard: 12-column grid for data tables and analytics
- Student Portal: Centered content with max-w-4xl for readability
- Responsive breakpoints: sm, md, lg, xl with mobile-first approach

### D. Component Library

**Navigation:**
- Admin: Persistent sidebar (w-64) with role indicator badge, collapsible on mobile
- Student: Top navigation bar with points summary always visible
- Both: User avatar dropdown in top-right with logout option

**Data Display:**
- Student Table (Admin): Striped rows, sortable columns, search filter, actions column
- Points Cards (Student): Large number display with trend indicators (↑/↓)
- Excel Upload Zone: Drag-and-drop area with file format preview

**Forms:**
- Points Update Form: Inline editing with number inputs, increment/decrement buttons
- Feedback Form: Textarea with character counter, category selector, attachment option
- Login Forms: Clean, centered cards with role-specific icons

**Cards & Containers:**
- Dashboard Cards: Rounded-lg borders with subtle shadow, hover lift effect
- Stat Cards: Grid layout showing total students, average points, pending feedback
- Feedback Cards: Timeline-style display with student info and timestamp

**Interactive Elements:**
- Primary Buttons: Solid background with primary color, rounded-md
- Secondary Buttons: Outline style with hover fill transition
- Danger Actions: Red accent for delete/remove operations
- Icons: Heroicons throughout for consistency

### E. Portal-Specific Features

**Admin Portal Design:**
- Header: "Admin Dashboard" with quick stats bar (total students, pending actions)
- Main Section: Tabbed interface (Students | Points | Feedback | Upload)
- Upload Section: Prominent dropzone with supported format list (.xlsx, .csv)
- Points Editor: Table with inline edit mode, bulk update checkbox system
- Feedback Manager: List view with filter tags and status badges

**Student Portal Design:**
- Header: Personalized welcome with total points prominently displayed
- Points Dashboard: Large score display with visual progress bar/ring chart
- History Section: Timeline of point changes with dates and reasons
- Feedback Section: Simple form with category dropdown and text area
- Performance Insights: Optional visual chart showing points trend over time

### F. Images

**Hero Section:**
No traditional hero image. Instead, use:
- Admin Portal: Clean illustration/icon of dashboard analytics (subtle, top-right corner)
- Student Portal: Achievement badge or trophy illustration (motivational, centered above points)

**Supporting Images:**
- Empty States: Friendly illustrations for "no data" scenarios (upload prompt, no feedback yet)
- Success States: Celebration micro-animations for point increases (confetti effect, sparkles)

### G. Micro-Interactions (Minimal)

**Essential Only:**
- File upload: Progress bar animation with percentage
- Points update: Brief highlight flash on cell change
- Success feedback: Green checkmark fade-in confirmation
- Tab switching: Subtle slide transition (100ms)

### H. Accessibility & Polish

- Consistent dark mode across all inputs and modals
- Focus states: 2px ring with primary color offset
- Loading states: Skeleton screens for tables, spinner for actions
- Error states: Inline validation with red text and icon
- Role-based color coding in subtle accents (admin purple header, student cyan header)
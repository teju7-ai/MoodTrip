# MoodTrip

**Mood and Budget-Aware AI Travel Itinerary Planner**

MoodTrip creates a day-by-day travel outline from a destination, trip duration, activities-and-food budget, and selected mood. It is an AI course group-project prototype and a planner, with no booking or payment functionality.

## Features

- Animated, responsive Home page with five mood cards.
- Four-step Planner: destination, days, budget, and mood.
- Animated loading screen with a return-to-choices action.
- AI-assisted itineraries with day tabs, suggested times, durations, estimated costs, and Google Maps links.
- Itinerary storage and editable star ratings in Supabase.
- Feedback-based place ranking for the same mood.
- Confirm plan page with browser-based PDF export covering every day.
- Share links that display an itinerary without the creator's rating-edit code.
- About page explaining the AI flow and design-thinking work.

## Technology

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router.
- Backend: Node.js and Express.
- AI access: OpenRouter, using the `openrouter/free` route.
- Location and places data: Geoapify, with OpenStreetMap attribution.
- Database: Supabase PostgreSQL, accessed from the backend.

Gemini was tested during development. The current generation code uses OpenRouter instead.

## How the AI flow works

1. The Planner collects the user's destination, days, budget, and mood.
2. The backend resolves the destination using Geoapify geocoding.
3. It searches within 15 km of the resolved center for mood-related places and meal options.
4. Mood-to-category rules assign initial scores.
5. The feedback ranker reads up to 200 recent rated itineraries for the same mood and makes small score adjustments for matching place IDs.
6. OpenRouter receives a shortlist and a JSON schema, then chooses and sequences three stops per day.
7. The backend checks the result's structure, day count, place IDs, repeated IDs, time periods, visit durations, travel gaps, estimated total, meal classification, and mood matches.
8. The itinerary is saved in Supabase and returned to the frontend.

These checks do not verify actual opening hours, venue availability, entry prices, travel times, or duplicate physical venues represented by different source IDs.

## Feedback ranking

The prototype uses a simple statistical ranker, not a trained recommendation model.

For a place appearing in rated itineraries of the same mood:

```text
smoothed rating = (sum of ratings + 3 × 3) / (rating count + 3)
feedback adjustment = (smoothed rating - 3) × 5
final score = mood score + feedback adjustment
```

The three neutral starting ratings reduce the influence of a single review. Each place counts once per rated itinerary. Updating a rating changes that itinerary's existing feedback record rather than adding another one.

A whole-itinerary rating is an indirect signal about its places. Recommendation quality still needs evaluation with users. Place selection by the AI is guided by these scores; it is not guaranteed to follow their order exactly.

## Budget and planning limits

- Budgets are entered in INR and apply per person to the entire trip's listed activities and meals.
- Flights, hotels, transport, and unlisted meals are excluded.
- The current form supports 1–7 days and budgets from ₹1,000 to ₹50,000.
- The result is a three-stop daily outline, not a complete schedule of every meal or expense.
- Costs are AI estimates, not live or verified prices. Costs outside India are also estimates in INR, without live exchange-rate conversion.
- Suggested visit times and travel gaps are not checked against live routing or business opening hours.
- Place coverage and destination resolution depend on Geoapify data. Include a state or country to reduce ambiguity.
- The 15 km search does not cover an entire state or country when a broad region is entered.
- Free-model availability, output quality, latency, and provider limits can affect generation. Invalid answers are rejected and shown as errors.

## Local setup

Install Node.js and npm, then open PowerShell in the project folder.

```powershell
npm install
```

Create a `.env` file beside `package.json`:

```env
OPENROUTER_API_KEY=your_openrouter_key
GEOAPIFY_API_KEY=your_geoapify_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Use credentials belonging to the configured accounts and Supabase project. Keep `.env` out of Git and never prefix secret keys with `VITE_` or place them in frontend source files.

The Supabase project needs the `itineraries` and `ratings` tables created during setup, with the backend service role granted access. The project schema SQL will be included with the repository setup files.

### Start the website

In the first PowerShell window:

```powershell
npm run dev
```

Open the Local URL Vite prints, usually `http://localhost:5173/`.

### Start the backend

In a second PowerShell window, from the same project folder:

```powershell
node server/index.mjs
```

The backend listens on `http://localhost:3001`. Keep both windows running. Vite forwards `/api` requests to the backend through its local proxy.

The health check is available at `http://localhost:3001/api/health` and through the frontend at `/api/health`.

### Build the frontend

```powershell
npm run build
```

This builds frontend files into `dist/`. It does not deploy the Express backend or configure a production API connection. Production deployment needs both parts configured.

## Saving and sharing

- Generated itineraries are stored in Supabase.
- The creator's current plan and private feedback code are retained in browser-tab session storage, when available, and passed between pages through navigation state.
- The backend stores a hash of the feedback code, not the plaintext code. Rating and share-link creation requests must supply the matching code.
- Anyone with a created share link can read that itinerary. Shared responses exclude the feedback code and cannot authorize rating changes by themselves.
- Creating a share link again reuses its existing sharing code.
- Localhost links work on the same computer while the app is running. Public links require deployment.
- PDF export uses the browser print dialog. Choose Save as PDF or Microsoft Print to PDF.
- There is no account-based creator recovery or share-link revocation interface yet. Losing the feedback code removes the ability to manage that plan through the current UI.

## Design thinking

- Initial mood taxonomy: relaxing, adventurous, cultural, foodie, nightlife.
- Working prototype: Home, Planner, loading experience, Itinerary, Confirm, shared view, and About.
- Planned research: traveler interviews to validate planning problems and mood categories.
- Planned evaluation: usability sessions measuring completion, confusion, perceived budget fit, and mood fit.

Do not present planned interviews or usability studies as completed evidence. Update the About page and this README after conducting them.

## Attribution

Places powered by [Geoapify](https://www.geoapify.com/). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

Google Maps links open external searches. MoodTrip is not a booking service and does not guarantee venue availability.

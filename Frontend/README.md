# Workshop Hub: frontend

React + Vite frontend for the WorkshopHub Spring Boot backend (Workshop Registration Service challenge).

## Run it

1. **Start the backend** (see its README: Java 21, MySQL, `mvn spring-boot:run`). It listens on `http://localhost:8080` and seeds an Admin plus three sample workshops.
2. **Start the frontend** (Node 18+):

   ```bash
   npm install
   npm run dev          # http://localhost:5173
   ```

   Keep it on **port 5173**: the backend's CORS rule only allows that origin (`FRONTEND_ORIGIN`). Vite is set to fail instead of silently picking another port.

3. If the API is not on `localhost:8080`, copy `.env.example` to `.env` and set `VITE_API_URL`.

### First login (dev only)

| Email | Password |
| --- | --- |
| `admin@workshophub.local` | `ChangeMe123!` |

On the login screen (dev mode) there is a **Fill in seeded admin** button. The Admin lands on **Team accounts**: create a *Programme manager* and a *Front desk* account there, sign out, and sign in as each to try the other roles.

## What each role sees

| Role | Screens | Can do |
| --- | --- | --- |
| Administrator | Team accounts | List and create accounts, set roles |
| Programme manager | Workshops | Add, edit, delete workshops; register and cancel attendees; view history |
| Front desk | Workshops | View workshops; register and cancel attendees; view history |

Buttons a role can't use are hidden, but that is only convenience. Every rule is enforced by the backend, and the UI shows the backend's refusal message if a call is rejected.

## Features

- **Finding workshops**: date presets (Upcoming, Rest of this week, Next 7 days, Any date), custom from/to dates, status, and a "Has free seats" toggle. Results are sorted by date and summarised ("4 workshops, 38 seats free").
- **Seat grid**: each workshop draws its capacity as seats, filled when taken.
- **Registering**: name and email on the workshop page. If a colleague takes the last seat first, the backend refuses; the UI shows its message and re-reads the real seat count.
- **History**: Active / Cancelled / Full history views with search. Every row shows who registered it and when, and who cancelled it and when. Cancelling never deletes.
- **Live-ish data**: workshop screens quietly refresh every 15-20 s and when the tab regains focus, so a screen left open at the front desk stays current.
- **Accessibility and responsive**: keyboard focus styles, native dialogs, labelled controls, reduced-motion support; registrations stack into rows on phones.

## Code map

```
src/
  api.js            fetch wrapper, Basic-auth header, error normalisation
  auth.jsx          session + role abilities
  format.js         date/seat helpers (backend dates are zone-less LocalDateTime)
  hooks.js          useAutoRefresh
  components/       SeatGrid, Modal (native <dialog>), ConfirmDialog, Toasts, WorkshopForm, Layout…
  pages/            Login, Workshops, WorkshopDetail, Team
  styles.css        design tokens + all styling
```

## Decisions and things to know

- **Auth**: the backend uses stateless HTTP Basic. After `POST /api/auth/login` succeeds, the client keeps the encoded credentials in `sessionStorage` (survives refresh, cleared when the tab closes) and sends them on each request. Any 401 signs the user out with a notice. Over HTTPS this is acceptable for the assessment; a production system should move to tokens or sessions.
- **Admins can't see workshops**: the backend returns 403 on `/api/workshops/**` for ADMIN, so the Admin experience is Team accounts only.
- **"Full" is derived**: the backend only stores `FULL` if someone sets it manually, so the UI shows *Full* whenever `availableSeats` is 0. Filtering by *Full* is done client-side for the same reason. Registration is only possible while the stored status is `Open`.
- **Editing workshops**: the backend validates `dateTime` as `@Future` on updates too, so a workshop whose start time has passed can't be edited until that rule is relaxed. The form shows the backend's message.
- **Not in the backend, so not in the UI**: editing or disabling accounts, waitlist, and the audit trail for workshop/role changes.
- **Verification**: I built the app and drove it end to end in a headless browser against a mock of this API (same routes, roles, status codes and error shapes), covering every role, the full-workshop state, cancel + history, edit/delete guards, session expiry and a 390 px mobile layout. I could not run the Java/MySQL backend in my environment, so do one pass against the real backend before relying on it.

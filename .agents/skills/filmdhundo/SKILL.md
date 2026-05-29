# FilmDhundo — Copilot Skill File
# Place at: .github/copilot-instructions.md

---

## PROJECT IDENTITY

Name: FilmDhundo
Concept: Free movie discovery platform for India
Tagline: "Subscription ke bina kya dekh sakte ho"
Type: Movie aggregator — we NEVER host video content

---

## MOST IMPORTANT RULES — NEVER BREAK

1. NEVER change existing design, colors, fonts, layout
2. NEVER change existing component structure
3. NEVER change existing CSS or Tailwind classes
4. NEVER remove any existing feature
5. NEVER use green color for badges or branding
6. NEVER add dark theme — keep existing light white theme
7. NEVER change red #E24B4A primary color
8. NEVER change white #ffffff background
9. NEVER change existing card design
10. ONLY add new features listed in tasks
11. ONE task at a time — wait for approval
12. pnpm is the package manager — use pnpm always

---

## EXISTING TECH STACK — DO NOT CHANGE

Frontend:
  Framework:     React 18 + TypeScript (.tsx)
  Styling:       Tailwind CSS + existing classes
  UI:            Shadcn/ui + Radix UI
  Routing:       Wouter
  Data:          TanStack React Query
  Build:         Vite

Backend:
  Runtime:       Node.js
  Framework:     Express.js v5
  Language:      TypeScript (.ts)
  HTTP:          Axios
  Cache:         Node-Cache (1 hour TTL)
  Logging:       Pino

Package manager: pnpm ONLY

---

## EXISTING DESIGN SYSTEM — READ ONLY, NEVER CHANGE

Primary color:    #E24B4A (red)
Background:       #ffffff (white)
Card background:  #ffffff (white)
Secondary bg:     #f5f5f5 (light gray)
Border:           #e0e0e0
Text primary:     #1a1a1a
Text secondary:   #666666
Border radius:    10px
Card hover:       translateY(-3px)

Fonts:
- Inter (English)
- Noto Sans Devanagari (Hindi)

---

## BADGE COLORS — USE EXACTLY THESE

Platform badges (existing — do not change):
prime:   #00A8E0
netflix: #E50914
hotstar: #1F80E0
zee5:    #7B2D8B
sony:    #0057A8
mx:      #FF6B35
minitv:  #00A8E0
jio:     #8B5CF6
youtube: #FF0000

NEW badges to add (use these colors only):
Age U:   background #E24B4A (red — matches brand), color white
Age UA:  background #f5f5f5 (light gray), color #1a1a1a, border #e0e0e0
Age A:   background #1a1a1a (dark), color white

IMDb badge:
background: rgba(0,0,0,0.6)
color: #F5C518 (yellow)
position: bottom-right of poster

FREE badge: DO NOT USE GREEN
Use existing primary red #E24B4A instead
OR use platform color badge only
Keep it consistent with existing design

---

## FREE PLATFORMS TO FEATURE

mx:         MX Player       #FF6B35  free=true
minitv:     Amazon MiniTV   #00A8E0  free=true  highlight=true
youtube:    YouTube         #FF0000  free=true
jiocinema:  JioCinema       #8B5CF6  free=true
zee5free:   ZEE5 Free       #7B2D8B  free=true
hotstarfree: Hotstar Free   #1F80E0  free=true

Paid platforms (affiliate suggestions only):
prime:   Amazon Prime  affiliate only
netflix: Netflix       affiliate only
hotstar: Hotstar full  affiliate only
zee5:    ZEE5 full     affiliate only
sony:    SonyLIV       affiliate only

---

## AFFILIATE LINK RULES

Affiliate URLs stored in ott.ts config
Replace placeholder values with real URLs
Current structure already exists — only update values

Free platform buttons: direct watch URL opens new tab
Paid platform buttons: affiliate URL opens new tab

---

## HINDI TEXT TO USE

Search:        "Movie ya series dhundo..."
Loading:       "Movies la rahe hain..."
Empty:         "Koi movie nahi mili"
Watch free:    "Abhi Dekho"
Watchlist:     "Baad Mein Dekho"
Share:         "Dosto Ko Batao"
Platform:      "Kahan Dekhein"
Similar:       "Isse Milti Julti Movies"
New week:      "Is Hafte Kya Naya"
MiniTV:        "Amazon MiniTV — Yeh Sab Free Hai!"
MiniTV sub:    "Jaante the? Koi subscription nahi chahiye"
Family safe:   "Family Safe Mode"
Age filter:    "Sirf U aur UA rated content"
Trivia:        "Kya Aap Jaante The?"
Reaction yes:  "Pasand Aaya"
Reaction no:   "Pasand Nahi Aaya"
Coming soon:   "Jaldi Aa Raha Hai"
Install:       "FilmDhundo install karo"
Not free:      "Yeh movie abhi free nahi hai"
Trial suggest: "Lekin yahan free trial mil sakta hai"

---

## FILE LOCATIONS

Frontend pages:  artifacts/filmdhundo/src/pages/
Components:      artifacts/filmdhundo/src/components/
Hooks:           artifacts/filmdhundo/src/hooks/
Lib/config:      artifacts/filmdhundo/src/lib/
Backend routes:  artifacts/api-server/src/routes/
Backend lib:     artifacts/api-server/src/lib/

---

## SECURITY RULES

All API keys in .env only — never in frontend files
TMDB key only in api-server — never in filmdhundo src
Razorpay secret only in api-server
Admin page requires password before showing content
Admin link not visible in public navbar or footer

---

## CODE QUALITY

TypeScript strict — no any types
Try/catch on all async functions
Loading states on all data fetches
Empty states on all lists
Error boundaries on pages
No console.log in production
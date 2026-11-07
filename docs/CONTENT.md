# Content

All real E-Cell content gathered for v1, ready to go into `supabase/seed.sql`. Source: the previous repo `kc-ecell/Ecell-2026-27`, with only the content taken. Items marked **VERIFY** need a human to confirm before launch. Items marked **TBD** are missing.

---

## 1. Identity

| Field | Value |
|---|---|
| Name | Entrepreneurship Cell, KCCEMSR |
| Short | E-Cell KCCEMSR (also written "KCECell") |
| College | K.C. College of Engineering and Management Studies and Research (KCCEMSR) |
| Location | Kopri, Thane (East), Maharashtra |
| Founded | 2016 |
| Faculty Coordinator | Prof. Yogesh Karunakar |
| Contact email | **TBD** |
| Instagram / LinkedIn / others | **TBD** |
| Domain | **TBD** (to be provided) |

## 2. Taglines and hero copy

- Old site subline (kept): "We help students move from intent to execution through ventures, hackathons, mentorship, and visible outcomes."
- Old site story line: "We've been around for years, but we're always building what's next."
- Old site short pitch: "From new tech and entrepreneurship to hackathons and hands-on workshops, E-Cell is where curious minds come to learn, build, connect and try things out."
- Headline options for v1 hero (pick one, editable in admin): **"Ideas in. Startups out."** · "Build what's next." · "We ship founders." · "Build That."

## 3. Mission and vision

### Mission (original)
> The Entrepreneurship Cell at KCCEMSR is dedicated to fostering an entrepreneurial mindset among students. We provide a comprehensive platform that nurtures innovative ideas, facilitates startup development, and connects aspiring entrepreneurs with industry experts and resources. Through workshops, seminars, competitions, and mentorship programs, we aim to create a vibrant ecosystem where creativity meets opportunity, and ideas transform into impactful ventures.

### Mission (tightened, suggested for the site)
> We help KCCEMSR students turn ideas into ventures. We run workshops, competitions, hackathons and mentorship sessions, and we connect student founders with people from industry who have done it before.

### Vision (original)
> To be recognized as a leading entrepreneurship cell that shapes the future of business innovation in India. We envision a community where every student has the confidence, skills, and resources to turn their entrepreneurial dreams into reality. We strive to build a culture where failure is seen as a stepping stone to success, and where innovation is celebrated and supported at every level.

### Vision (tightened, suggested)
> Every student at KCCEMSR should have the skills, the network and the nerve to start something. Failing at it should count as progress.

The team picks original or tightened per section. Both are stored, and the admin settings hold whichever is live.

## 4. Stats (confirmed accurate by the team, 2026-10-28)

| slug | label | value | suffix | source | verified_on |
|---|---|---|---|---|---|
| `members` | Active members | 500 | + | E-Cell member records | 2026-10-28 |
| `events` | Events and workshops | 100 | + | E-Cell event records 2016–2026 | 2026-10-28 |
| `partners` | Industry partners | 20 | + | Partnership records | 2026-10-28 |
| `initiatives` | Student-led initiatives | 10 | + | E-Cell records | 2026-10-28 |

## 5. Timeline (level map)

| LVL | Year | Title | Description |
|---|---|---|---|
| 01 | 2016 | E-Cell is founded | E-Cell was set up to give students a place to explore ideas, develop them, and turn them into ventures. |
| 02 | 2017 | First experiments | Google Crowdsource programmes, drone workshops and entrepreneurship bootcamps got students building with new tech. |
| 03 | 2018 | National stage | 2nd place at IIT Bombay's National Entrepreneurship Challenge. |
| 04 | 2019 | Innovation Mela win | 1st place at the Innovation Mela. Several student ventures and projects started inside the Cell's incubation work. |
| 05 | 2020 | RESPAWN + going online | RESPAWN brought hundreds of students together for an inter-college gaming event. When the pandemic hit, E-Cell moved online and kept going. |
| 06 | 2021–23 | Beyond events | Real-world projects, international collaborations and tech-driven solutions, with stronger incubation and mentorship. |
| 07 | 2024 | NEC grand finale | Collaborated with E-Cell IIT Bombay and reached the National Entrepreneurship Challenge grand finale, finishing 44th among 500+ teams. |
| 08 | 2025 | SIH winners | E-Cell teams kept competing nationally. Hack4Hygiene won Smart India Hackathon 2025. |
| 09 | 2026 | Singularity (boss level) | Singularity turns ten years of entrepreneurship, innovation and competition into a platform built around hackathons, mentorship and building real solutions. |

## 6. Achievements

| Year | Title | Category | Organizer | Result | Highlight |
|---|---|---|---|---|---|
| 2018 | National Entrepreneurship Challenge | entrepreneurship | E-Cell, IIT Bombay | 2nd place | ✓ |
| 2019 | Innovation Mela | innovation | **VERIFY** organizer | 1st place | |
| 2024 | National Entrepreneurship Challenge | entrepreneurship | E-Cell, IIT Bombay | Grand finalist · 44th of 500+ teams | ✓ |
| 2025 | Smart India Hackathon 2025: Hack4Hygiene | hackathon | Govt. of India (MoE Innovation Cell / AICTE) | Winner | ✓ |

Team names, prize amounts and photos: **TBD** (ask the Coordination team).

## 7. Programs ("What we do" tabs)

| Tab | Kicker | Copy (draft) |
|---|---|---|
| `hackathons.ts` | Build under pressure | Flagship: Singularity. Teams of 2–4 build something real in a fixed window, with mentors on the floor and judges from industry. |
| `workshops.ts` | Learn by doing | Hands-on sessions and bootcamps on new tech and startup basics, from drones in 2017 to AI, IoT and web today. |
| `mentorship.ts` | Talk to people who've done it | Founders, faculty and industry mentors review ideas, pitch decks and prototypes. Incubation support for teams that keep going. |
| `competitions.ts` | Compete nationally | We send and prepare teams for NEC (IIT Bombay), Smart India Hackathon and other national challenges. |

**COPY-PENDING:** cadence and typical scale per program (Events team).

## 8. Events (seed list)

| slug | Title | Year | Format | Status | Notes |
|---|---|---|---|---|---|
| `singularity-2026` | Singularity | 2026 | hackathon | draft until dates are confirmed | Flagship. Old docs mention "intra-college hackathon, theme: Interstellar" (**VERIFY**). Dates, venue, registration link **TBD**. |
| `respawn-2020` | RESPAWN | 2020 | gaming | published (past) | Inter-college gaming event, "hundreds of students". Exact attendance **TBD**. |
| `drone-workshop-2017` | Drone Workshop | 2017 | workshop | published (past) | Details **TBD** |
| `google-crowdsource-2017` | Google Crowdsource | 2017 | workshop | published (past) | Details **TBD** |
| `entrepreneurship-bootcamp-2017` | Entrepreneurship Bootcamp | 2017 | bootcamp | published (past) | Details **TBD** |

The Events team should add the rest of the 100+ events through the admin panel, prioritising 2023–2026.

## 9. Departments

| slug | Name | Accent | Remit (one line, for About › Structure) |
|---|---|---|---|
| `faculty` | Faculty | violet | Guides and approves everything E-Cell runs. |
| `leadership` | Leadership | lime | Sets direction, runs the core team, handles money and paperwork. |
| `technical` | Technical | cyan | Cybersecurity, AI/ML, IoT, Web Dev and DevOps. Builds the tech, including this site. |
| `events` | Events & Operations | orange | Plans and runs events, hospitality and volunteers. |
| `media` | Media & Communications | pink | Social media, writing and editing. |

## 10. Team 2026-27 (current cohort)

`tier`: faculty / leadership / head / cohead. Photo ✓ = a portrait exists in the old repo's `src/assets/team/` (re-export at 2.5× rendered size as WebP before upload). The fun line goes on the card back.

### Faculty
| Name | Role | Photo | Fun line |
|---|---|---|---|
| Prof. Yogesh Karunakar | Faculty Coordinator | | Approves everything. Reads every proposal. Still replies at 11pm. |

### Leadership
| Name | Role | Photo | Fun line |
|---|---|---|---|
| Raaj Patkar | President | ✓ | Runs the show, calls the meetings nobody asked for, and somehow still finds time to sleep. Probably. |
| Daivik Pawar | Vice President | ✓ | The president when the president is busy. Knows where every document is, including the one you lost. |
| Subhra Parija | Secretary | ✓ | Writes the minutes no one reads and keeps the calendar honest. |
| Krishna Mundhara | Treasurer | | Counting money that doesn't exist yet and chasing invoices that do. |

### Technical
| Name | Role | Photo | Fun line |
|---|---|---|---|
| Aryan Wesavkar | Cybersecurity Head | ✓ | Breaks things on purpose so the rest of us don't have to. |
| Amey Thanekar | Cybersecurity Co-Head | | Backup paranoia. Runs the CTFs. Knows your password was in a dump. |
| Sachman Chadha | AI/ML Head | ✓ | Trains models and writes prompts like spells. Hallucinates, but on purpose. |
| Sanchita Pawar | AI/ML Co-Head | ✓ | Tames the GPU bill and reads the arXiv so the rest of the team can pretend they did. |
| Siddhi Pandey | IoT Head | ✓ | Solders things to other things. Owns at least four broken Arduinos. |
| Aditi Panchal | IoT Co-Head | ✓ | Has a favourite sensor. Won't admit which. Solders better than the head. |
| Ishwar Suthar | Web Dev Head | ✓ | Ships the site, breaks the site, fixes the site. Lives in dev tools. |
| Rushabh Makwana | Web Dev Co-Head | ✓ | Reviews the PRs the head rubber-stamped. Writes the tests nobody asked for. |
| Vaishnav Yewale | DevOps Head | ✓ | The deploy works on their machine, which is the only machine that matters. |
| Jeeval Patil | DevOps Co-Head | ✓ | Pages the team at 3am when the cluster sneezes. |

### Events & Operations
| Name | Role | Photo | Fun line |
|---|---|---|---|
| Piyush Singh | Event Head | ✓ | Says yes to every event idea, then figures out how. |
| Sahil Madiwala | Event Co-Head | ✓ | Books the room, books the mic. Brings the clipboard to every meeting. |
| Siddhesh Pawar | Event Co-Head | ✓ | The second clipboard. The reason nothing catches fire. |
| Krupa Marakal | Hospitality Head | ✓ | Feeds the team, feeds the speakers. Knows which canteen is open on Sundays. |
| Jimeet Trivedi | Volunteering Head | ✓ | Herds the volunteers. Has a group chat that pings constantly and a patient face. |

### Media & Communications
| Name | Role | Photo | Fun line |
|---|---|---|---|
| Siddhi Bhangale | Design Head | ✓ | Turns rough napkin sketches into pixel-perfect Figma components. Argues about kerning and grid systems. |
| Disha Suthar | Social Media Head | ✓ | Knows which trend to skip and which one to hijack. |
| Devyani Palaye | Social Media Co-Head | | Holds the brand voice together when everyone wants to be funny. |
| Maahi Nagdeote | Editor | | Reads the writing twice, fixes it once. The reason the posts sound human. |

**Total:** 1 faculty + 24 students = 25.
**Note:** check name spellings with each person before launch (for example "Chadha" vs "Chadhaa").

## 11. Copy voice

- Direct, specific, a little playful. Write like people who've actually run the events.
- Numbers over adjectives: "500+ members" beats "a huge community".
- Students get second person and short sentences. Partners get facts first.
- Buttons are verb + object: "See upcoming events", "Download photos", "Send message". Never "Learn more" or "Click here".
- Empty states: say what's true, when it changes, and one action.
- Playful lines live in game UI, the terminal, and team fun lines, not in facts.
- Banned words: empower, unleash, unlock, synergy, leverage, cutting-edge, world-class, vibrant community, like-minded individuals, journey, revolutionary, game-changing.

## 12. Open items

| # | Item | Owner |
|---|---|---|
| 1 | Domain | Sachman |
| 2 | Official email, Instagram, LinkedIn URLs | Core team |
| 3 | IoT Co-Head name + photo | Technical |
| 4 | Portraits for the 14 members without one | Each member |
| 5 | Singularity 2026: dates, venue, theme, registration link | Events |
| 6 | Past events list with dates and attendance (at least 2023–2026) | Events |
| 7 | Event photos, 30+ graded, with captions | Media |
| 8 | Achievement details (team names, prizes, photos); Innovation Mela organizer | Coordination |
| 9 | Pick hero headline + original vs tightened mission/vision | President / VP |
| 10 | Staff emails for admin access (≤ configured cap, default 10) | President |
| 11 | College affiliation line for About (University of Mumbai, verify) | Faculty Coordinator |

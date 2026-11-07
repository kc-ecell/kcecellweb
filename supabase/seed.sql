-- Seed from docs/CONTENT.md. Content only — no real staff emails (owners are
-- inserted by hand in the production dashboard; see docs/DEPLOYMENT.md §3).
-- Dollar-quoted strings ($f$…$f$) carry apostrophes safely.

-- ============ departments ============
insert into departments (slug, name, accent, sort) values
  ('faculty',    'Faculty',               'violet', 0),
  ('leadership', 'Leadership',            'lime',   1),
  ('technical',  'Technical',             'cyan',   2),
  ('events',     'Events & Operations',   'orange', 3),
  ('media',      'Media & Communications','pink',   4)
on conflict (slug) do nothing;

-- ============ current cohort ============
insert into team_cohorts (label, start_year, is_current) values
  ('2026-27', 2026, true)
on conflict (label) do nothing;

-- ============ team 2026-27 ============
insert into team_members (cohort_id, department, tier, name, role, fun_stat, sort)
select c.id, v.department, v.tier::member_tier, v.name, v.role, v.fun_stat, v.sort
from team_cohorts c
cross join (values
  ('faculty',   'faculty',    'Prof. Yogesh Karunakar','Faculty Coordinator',    $f$Approves everything. Reads every proposal. Still replies at 11pm.$f$, 0),
  ('leadership','leadership', 'Raaj Patkar',           'President',              $f$Runs the show, calls the meetings nobody asked for, and somehow still finds time to sleep. Probably.$f$, 1),
  ('leadership','leadership', 'Daivik Pawar',          'Vice President',         $f$The president when the president is busy. Knows where every document is, including the one you lost.$f$, 2),
  ('leadership','leadership', 'Subhra Parija',        'Secretary',              $f$Writes the minutes no one reads and keeps the calendar honest.$f$, 3),
  ('leadership','leadership', 'Krishna Mundhara',      'Treasurer',              $f$Counting money that doesn't exist yet and chasing invoices that do.$f$, 4),
  ('technical', 'head',       'Aryan Wesavkar',        'Cybersecurity Head',     $f$Breaks things on purpose so the rest of us don't have to.$f$, 5),
  ('technical', 'cohead',     'Amey Thanekar',         'Cybersecurity Co-Head',  $f$Backup paranoia. Runs the CTFs. Knows your password was in a dump.$f$, 6),
  ('technical', 'head',       'Sachman Chadha',        'AI/ML Head',             $f$Trains models and writes prompts like spells. Hallucinates, but on purpose.$f$, 7),
  ('technical', 'cohead',     'Sanchita Pawar',        'AI/ML Co-Head',          $f$Tames the GPU bill and reads the arXiv so the rest of the team can pretend they did.$f$, 8),
  ('technical', 'head',       'Siddhi Pandey',         'IoT Head',               $f$Solders things to other things. Owns at least four broken Arduinos.$f$, 9),
  ('technical', 'head',       'Ishwar Suthar',         'Web Dev Head',           $f$Ships the site, breaks the site, fixes the site. Lives in dev tools.$f$, 10),
  ('technical', 'cohead',     'Rushabh Makwana',       'Web Dev Co-Head',        $f$Reviews the PRs the head rubber-stamped. Writes the tests nobody asked for.$f$, 11),
  ('technical', 'head',       'Vaishnav Yewale',       'DevOps Head',            $f$The deploy works on their machine, which is the only machine that matters.$f$, 12),
  ('technical', 'cohead',     'Jeeval Patil',          'DevOps Co-Head',         $f$Pages the team at 3am when the cluster sneezes.$f$, 13),
  ('events',    'head',       'Piyush Singh',          'Event Head',             $f$Says yes to every event idea, then figures out how.$f$, 14),
  ('events',    'cohead',     'Sahil Madiwala',        'Event Co-Head',          $f$Books the room, books the mic. Brings the clipboard to every meeting.$f$, 15),
  ('events',    'cohead',     'Siddhesh Pawar',        'Event Co-Head',          $f$The second clipboard. The reason nothing catches fire.$f$, 16),
  ('events',    'head',       'Krupa Marakal',         'Hospitality Head',       $f$Feeds the team, feeds the speakers. Knows which canteen is open on Sundays.$f$, 17),
  ('events',    'head',       'Jimeet Trivedi',        'Volunteering Head',      $f$Herds the volunteers. Has a group chat that pings constantly and a patient face.$f$, 18),
  ('media',     'head',       'Disha Suthar',          'Social Media Head',      $f$Knows which trend to skip and which one to hijack.$f$, 19),
  ('media',     'cohead',     'Devyani Palaye',        'Social Media Co-Head',   $f$Holds the brand voice together when everyone wants to be funny.$f$, 20),
  ('media',     'head',       'Maahi Nagdeote',        'Editor',                 $f$Reads the writing twice, fixes it once. The reason the posts sound human.$f$, 21)
) as v(department, tier, name, role, fun_stat, sort)
where c.label = '2026-27';
-- NOTE: IoT Co-Head is an open item (docs/CONTENT.md §12) — add via admin once named.

-- ============ stats ============
insert into stats (slug, label, value, suffix, source, verified_on, sort) values
  ('members',     'Active members',          500, '+', 'E-Cell member records',            '2026-10-28', 0),
  ('events',      'Events and workshops',    100, '+', 'E-Cell event records 2016-2026',   '2026-10-28', 1),
  ('partners',    'Industry partners',        20, '+', 'Partnership records',               '2026-10-28', 2),
  ('initiatives', 'Student-led initiatives',  10, '+', 'E-Cell records',                    '2026-10-28', 3)
on conflict (slug) do nothing;

-- ============ timeline ============
insert into timeline_milestones (year_label, level, title, description, sort) values
  ('2016',    1, 'E-Cell is founded',        $f$E-Cell was set up to give students a place to explore ideas, develop them, and turn them into ventures.$f$, 0),
  ('2017',    2, 'First experiments',        $f$Google Crowdsource programmes, drone workshops and entrepreneurship bootcamps got students building with new tech.$f$, 1),
  ('2018',    3, 'National stage',           $f$2nd place at IIT Bombay's National Entrepreneurship Challenge.$f$, 2),
  ('2019',    4, 'Innovation Mela win',      $f$1st place at the Innovation Mela. Several student ventures and projects started inside the Cell's incubation work.$f$, 3),
  ('2020',    5, 'RESPAWN + going online',   $f$RESPAWN brought hundreds of students together for an inter-college gaming event. When the pandemic hit, E-Cell moved online and kept going.$f$, 4),
  ('2021-23', 6, 'Beyond events',            $f$Real-world projects, international collaborations and tech-driven solutions, with stronger incubation and mentorship.$f$, 5),
  ('2024',    7, 'NEC grand finale',         $f$Collaborated with E-Cell IIT Bombay and reached the National Entrepreneurship Challenge grand finale, finishing 44th among 500+ teams.$f$, 6),
  ('2025',    8, 'SIH winners',              $f$E-Cell teams kept competing nationally. Hack4Hygiene won Smart India Hackathon 2025.$f$, 7),
  ('2026',    9, 'Singularity (boss level)', $f$Singularity turns ten years of entrepreneurship, innovation and competition into a platform built around hackathons, mentorship and building real solutions.$f$, 8);

-- ============ achievements ============
insert into achievements (title, year, category, organizer, result, is_highlight, sort) values
  ('National Entrepreneurship Challenge', 2018, 'entrepreneurship', 'E-Cell, IIT Bombay', '2nd place',                           true,  0),
  ('Innovation Mela',                     2019, 'innovation',       null,                 '1st place',                           false, 1),
  ('National Entrepreneurship Challenge', 2024, 'entrepreneurship', 'E-Cell, IIT Bombay', 'Grand finalist, 44th of 500+ teams',  true,  2),
  ('Smart India Hackathon 2025: Hack4Hygiene', 2025, 'hackathon',   'Govt. of India (MoE Innovation Cell / AICTE)', 'Winner',    true,  3);

-- ============ site settings ============
insert into site_settings (key, value) values
  ('org.identity', $j${"name":"Entrepreneurship Cell, KCCEMSR","short":"E-Cell KCCEMSR","college":"K.C. College of Engineering and Management Studies and Research","city":"Kopri, Thane (East), Maharashtra","founded":2016}$j$),
  ('org.mission',  $j${"text":"We help KCCEMSR students turn ideas into ventures. We run workshops, competitions, hackathons and mentorship sessions, and we connect student founders with people from industry who have done it before."}$j$),
  ('org.vision',   $j${"text":"Every student at KCCEMSR should have the skills, the network and the nerve to start something. Failing at it should count as progress."}$j$),
  ('org.contact',  $j${"email":null,"address":"K.C. College of Engineering and Management Studies and Research, Kopri, Thane (E)","reply_time":"within 2 working days"}$j$),
  ('org.socials',  $j${"instagram":null,"linkedin":null}$j$),
  ('home.hero',    $j${"headline_lines":["Ideas in.","Startups out."],"subline":"We help students move from intent to execution through ventures, hackathons, mentorship, and visible outcomes."}$j$),
  ('home.marquee', $j$["SIH 2025 WINNER","NEC IIT-B 2ND PLACE (2018)","500+ MEMBERS","100+ EVENTS","SINGULARITY 2026"]$j$),
  ('private.staff_cap',     $j${"max_active_staff":10}$j$),
  ('private.notify_emails', $j$[]$j$)
on conflict (key) do nothing;

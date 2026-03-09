import 'models.dart';

const List<WeekPlan> weekPlans = [
  WeekPlan(
    id: 'w1',
    code: 'S01',
    title: 'Demarrage: PortSwigger + dessin + bug bounty nightly',
    range: '9-15 mars 2026',
    tasks: [
      PlanTask(
        id: 's_w1_l1_m',
        track: 'PortSwigger',
        title: 'SQLi foundations',
        detail: 'Cours complet + labs Apprentice',
      ),
      PlanTask(
        id: 's_w1_l1_a',
        track: 'Dessin carnet',
        title: 'Visual drill',
        detail: 'Mot injection -> 5 formes inventees',
      ),
      PlanTask(
        id: 'bb_s_w1_l1_s',
        track: 'Bug Bounty',
        title: 'Night hunt',
        detail: '2h minimum before 00:00',
        isBugBounty: true,
      ),
      PlanTask(
        id: 's_w1_l3_m',
        track: 'PortSwigger',
        title: 'Authentication',
        detail: 'Cours + labs Apprentice and Practitioner',
      ),
      PlanTask(
        id: 's_w1_l5_m',
        track: 'PortSwigger',
        title: 'Path traversal',
        detail: 'Cours + all labs',
      ),
      PlanTask(
        id: 's_w1_l6_m',
        track: 'Jorgensen',
        title: 'Assembly intro',
        detail: 'Ch.1-2 + GDB notes',
      ),
    ],
  ),
  WeekPlan(
    id: 'w2',
    code: 'S02',
    title: 'K&R starts + reviews + PortSwigger continuation',
    range: '16-22 mars 2026',
    tasks: [
      PlanTask(
        id: 's_w2_l1_m',
        track: 'PortSwigger',
        title: 'Command injection',
        detail: 'Cours + all labs',
      ),
      PlanTask(
        id: 's_w2_l2_m',
        track: 'K&R',
        title: 'Chapter 1',
        detail: 'Tutorial intro + all exercises',
      ),
      PlanTask(
        id: 's_w2_l4_m',
        track: 'K&R',
        title: 'Chapter 2',
        detail: 'Types, operators and exercises',
      ),
      PlanTask(
        id: 's_w2_l5_a',
        track: 'Review blog',
        title: 'K&R review #2',
        detail: 'Publish review chapter 2',
      ),
      PlanTask(
        id: 's_w2_l6_m',
        track: 'Jorgensen',
        title: 'Chapter 3-4',
        detail: 'Data representation + GDB tests',
      ),
      PlanTask(
        id: 'bb_s_w2_l4_s',
        track: 'Bug Bounty',
        title: 'Night hunt',
        detail: '2h minimum before 00:00',
        isBugBounty: true,
      ),
    ],
  ),
  WeekPlan(
    id: 'wp1',
    code: 'PH1',
    title: 'Binary exploitation phase',
    range: 'Sept 2026 -> Fev 2027',
    tasks: [
      PlanTask(
        id: 's_p1_1_m',
        track: 'Phrack',
        title: 'Smashing the Stack',
        detail: 'Read + understand + exploit',
      ),
      PlanTask(
        id: 's_p1_1_a',
        track: 'GDB/Pwntools',
        title: '/bin/sh exploit',
        detail: 'No protections challenge',
      ),
      PlanTask(
        id: 's_p1_1_s',
        track: 'Review blog',
        title: 'Stack write-up',
        detail: 'Publish detailed exploit story',
      ),
    ],
  ),
];

const List<PsModule> psModules = [
  PsModule(
    id: 'ps_sqli',
    name: 'SQL Injection',
    month: 'Mars S1-S2',
    labs: [
      '[A] Hidden data',
      '[A] UNION attack basics',
      '[P] Blind SQLi boolean',
      '[P] Blind SQLi time based',
      '[E] Cookie blind SQLi',
    ],
  ),
  PsModule(
    id: 'ps_auth',
    name: 'Authentication',
    month: 'Mars S1-S2',
    labs: [
      '[A] Username enum',
      '[A] 2FA bypass',
      '[P] Timing side channel',
      '[P] Brute force cookie',
      '[E] 2FA brute force',
    ],
  ),
  PsModule(
    id: 'ps_ssrf',
    name: 'SSRF',
    month: 'Avril S2',
    labs: [
      '[A] Local server SSRF',
      '[P] Blacklist bypass',
      '[P] Whitelist bypass',
      '[E] Blind SSRF OOB',
    ],
  ),
  PsModule(
    id: 'ps_xss',
    name: 'XSS',
    month: 'Juin S1-S2',
    labs: [
      '[A] Reflected XSS',
      '[A] Stored XSS',
      '[A] DOM XSS',
      '[P] CSP bypass',
      '[E] Angular sandbox escape',
    ],
  ),
  PsModule(
    id: 'ps_smuggl',
    name: 'HTTP Request Smuggling',
    month: 'Sept S2',
    labs: [
      '[A] CL.TE',
      '[A] TE.CL',
      '[P] Differential responses',
      '[P] Capturing requests',
      '[E] Browser-powered smuggling',
    ],
  ),
];

const List<BookTask> bookTasks = [
  BookTask(id: 'kr1', book: 'K&R', title: 'Ch.1 review publiee', review: true),
  BookTask(id: 'kr2', book: 'K&R', title: 'Ch.2 review publiee', review: true),
  BookTask(id: 'kr3', book: 'K&R', title: 'Ch.3 review publiee', review: true),
  BookTask(id: 'jo1', book: 'Jorgensen', title: 'Ch.1-2 lus + GDB'),
  BookTask(id: 'jo2', book: 'Jorgensen', title: 'Ch.3-4 lus + GDB'),
  BookTask(id: 'jo5', book: 'Jorgensen', title: 'Review synthese publiee', review: true),
  BookTask(id: 'fd3', book: 'From Day 0', title: 'Ch.3 review publiee', review: true),
  BookTask(id: 'fd4', book: 'From Day 0', title: 'Ch.4 review publiee', review: true),
  BookTask(id: 'sl1', book: 'Steal Like an Artist', title: 'Lu en entier'),
  BookTask(id: 'sl2', book: 'Steal Like an Artist', title: 'Review 400 mots publiee', review: true),
  BookTask(id: 'dr1', book: 'Drawing on the Right Side', title: 'Ch.1-2 + exercices'),
  BookTask(id: 'dr3', book: 'Drawing on the Right Side', title: 'Review bloc 1 publiee', review: true),
];

const List<PhrackItem> phrackItems = [
  PhrackItem(
    id: 'phr_1',
    reference: '#49/14',
    title: 'Smashing the Stack for Fun and Profit',
    when: 'Aout 2026',
  ),
  PhrackItem(
    id: 'phr_2',
    reference: '#57/9',
    title: 'Vudo - malloc and heap exploitation',
    when: 'Oct 2026',
  ),
  PhrackItem(
    id: 'phr_3',
    reference: 'Shacham 2007',
    title: 'Geometry of Innocent Flesh on the Bone',
    when: 'Dec 2026',
  ),
  PhrackItem(
    id: 'phr_4',
    reference: '#71 PDF',
    title: 'Phrack #71 complete archive read',
    when: 'Phase 3',
  ),
];

const List<ArticleItem> baseArticles = [
  ArticleItem(
    id: 'art_ssrf_1',
    category: 'SSRF',
    title: 'SSRF Complete Guide - Intigriti',
    url: 'https://intigriti.com/researchers/blog/hacking-tools/ssrf',
    when: 'Mars',
  ),
  ArticleItem(
    id: 'art_ssrf_2',
    category: 'SSRF',
    title: 'Blind SSRF Chains - Assetnote',
    url: 'https://blog.assetnote.io/2021/01/13/blind-ssrf-chains/',
    when: 'Mars',
  ),
  ArticleItem(
    id: 'art_idor_1',
    category: 'IDOR/OAuth',
    title: 'Second Order IDOR Delete - Koalasec',
    url: 'https://blog.koalasec.co/how-a-second-order-idor-lets-you',
    when: 'Mars',
  ),
  ArticleItem(
    id: 'art_xss_1',
    category: 'XSS/WAF/CSP',
    title: 'XSS Filter Evasion Bypass - Acunetix',
    url: 'https://acunetix.com/blog/articles/xss-filter-evasion-bypass',
    when: 'Avril',
  ),
  ArticleItem(
    id: 'art_xss_2',
    category: 'XSS/WAF/CSP',
    title: 'Do Not Use alert(1) in XSS - LiveOverflow',
    url: 'https://liveoverflow.com/do-not-use-alert-1-in-xss/',
    when: 'Avril',
  ),
  ArticleItem(
    id: 'art_client_1',
    category: 'Client-side',
    title: 'Sanitize Client Side - Sonar',
    url: 'https://sonarsource.com/blog/sanitize-client-side-server',
    when: 'Mai',
  ),
  ArticleItem(
    id: 'art_fw_1',
    category: 'Frameworks',
    title: 'Next.js Cache Poisoning Black Hole - zhero',
    url: 'https://zhero-web-sec.github.io/research-and-things/nextjs-cache-poisoning-black-hole',
    when: 'Juin',
  ),
  ArticleItem(
    id: 'art_misc_1',
    category: 'SQL/Auth/Misc',
    title: 'Rails SQL Injection Gotchas - Edgescan',
    url: 'https://edgescan.com/rails-sql-injection-gotchas/',
    when: 'Avril',
  ),
  ArticleItem(
    id: 'art_sast_1',
    category: 'SAST',
    title: 'WTF is AI Native SAST - parsiya.net',
    url: 'https://parsiya.net/blog/wtf-is-ai-native-sast/',
    when: 'Phase 2',
  ),
  ArticleItem(
    id: 'art_bb_1',
    category: 'Bug Bounty',
    title: 'RCE in VS Code WSL - parsiya.net',
    url: 'https://parsiya.net/blog/2021-12-20-rce-in-visual-studio-code-wsl/',
    when: 'Phase 1',
  ),
  ArticleItem(
    id: 'art_fuzz_1',
    category: 'Fuzzing',
    title: 'Fuzzing WebSockets - aretekzs',
    url: 'https://aretekzs.com/posts/fuzzing-ws/',
    when: 'Phase 1',
  ),
  ArticleItem(
    id: 'art_paged_1',
    category: 'Paged Out / Kernel',
    title: 'Paged Out #8 - Data-only Kernel Exploit',
    url: 'https://pagedout.institute/download/PagedOut_008.pdf',
    when: 'Phase 3',
  ),
];

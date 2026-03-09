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

final List<PsModule> psModules = _parsePsModules(_psModulesSource);

List<PsModule> _parsePsModules(String source) {
  final modules = <PsModule>[];
  final moduleRegex = RegExp(
    r"\{\s*id:'((?:\\'|[^'])*)',\s*name:'((?:\\'|[^'])*)',\s*cat:'((?:\\'|[^'])*)',\s*month:'((?:\\'|[^'])*)',\s*url:'((?:\\'|[^'])*)',\s*labs:\[(.*?)\]\s*\}",
    dotAll: true,
  );
  final labRegex = RegExp(r"'((?:\\'|[^'])*)'");

  for (final match in moduleRegex.allMatches(source)) {
    final id = _decodeJsString(match.group(1) ?? '');
    final name = _decodeJsString(match.group(2) ?? '');
    final month = _decodeJsString(match.group(4) ?? '');
    final labsBlock = match.group(6) ?? '';
    final labs = <String>[];

    for (final labMatch in labRegex.allMatches(labsBlock)) {
      labs.add(_decodeJsString(labMatch.group(1) ?? ''));
    }

    modules.add(PsModule(id: id, name: name, month: month, labs: labs));
  }

  return modules;
}

String _decodeJsString(String value) {
  return value.replaceAll(r"\\'", "'").replaceAll(r'\\\\', r'\\');
}

const String _psModulesSource = '''
const PS_MODULES = [
  // ── SERVER-SIDE ──
  { id:'ps_sqli',   name:'SQL Injection',               cat:'Server-side', month:'Mars S1–S2',  url:'https://portswigger.net/web-security/sql-injection',  labs:['[A] Retrieving hidden data','[A] Subverting application logic','[A] UNION attack — determine columns','[A] UNION attack — find text col','[A] UNION attack — retrieve data','[A] UNION attack — multiple values','[A] DB version Oracle','[A] DB version MySQL/MSSQL','[A] DB contents (non-Oracle)','[A] DB contents Oracle','[P] Blind SQLi boolean','[P] Blind SQLi time-based','[P] Blind SQLi conditional errors','[P] Blind SQLi visible errors','[P] Blind SQLi out-of-band','[P] Blind SQLi OOB data exfil','[E] SQLi filter bypass via XML','[E] Blind SQLi cookie'] },
  { id:'ps_auth',   name:'Authentication',              cat:'Server-side', month:'Mars S1–S2',  url:'https://portswigger.net/web-security/authentication',  labs:['[A] Username enumeration via error','[A] 2FA simple bypass','[A] Password reset broken logic','[P] Username enum via subtly diff responses','[P] Username enum via response timing','[P] Broken brute-force protection IP block','[P] Username enum via account lock','[P] 2FA broken logic','[P] Brute-forcing stay-logged-in cookie','[P] Offline password cracking','[P] Password reset poisoning via middleware','[P] Password brute-force via password change','[E] Broken brute-force via multiple creds','[E] 2FA bypass using a brute-force attack'] },
  { id:'ps_path',   name:'Path Traversal',              cat:'Server-side', month:'Mars S1',     url:'https://portswigger.net/web-security/file-path-traversal',  labs:['[A] Simple case','[P] Sequences stripped non-recursively','[P] Superfluous URL-decode','[P] Validation of start of path','[P] Extension validation — null byte','[P] Validation of file extension URL-encoded'] },
  { id:'ps_cmdi',   name:'Command Injection',           cat:'Server-side', month:'Mars S2',     url:'https://portswigger.net/web-security/os-command-injection',  labs:['[A] Simple case','[P] Blind — time delays','[P] Blind — output redirection','[P] Blind — OOB interaction','[P] Blind — OOB data exfil'] },
  { id:'ps_bizlog', name:'Business Logic Vulnerabilities', cat:'Server-side', month:'Avril S1', url:'https://portswigger.net/web-security/logic-flaws',  labs:['[A] Excessive trust in client-side controls','[A] High-level logic flaw','[P] Low-level logic flaw','[P] Inconsistent handling trusted email','[P] Inconsistent security controls','[P] Weak isolation multi-step transactions','[P] Insufficient workflow validation','[P] Authentication bypass via flawed state machine','[E] Infinite money logic flaw','[E] Authentication bypass via encryption oracle','[E] Bypassing access controls using email address parsing discrepancies'] },
  { id:'ps_info',   name:'Information Disclosure',      cat:'Server-side', month:'Avril S1',    url:'https://portswigger.net/web-security/information-disclosure',  labs:['[A] In error messages','[A] On debug page','[A] Source code via backup files','[P] Auth bypass via information disclosure','[P] Information disclosure in version control history'] },
  { id:'ps_ac',     name:'Access Control',              cat:'Server-side', month:'Avril S1',    url:'https://portswigger.net/web-security/access-control',  labs:['[A] Unprotected admin functionality','[A] Unprotected admin — unpredictable URL','[A] User role controlled by request parameter','[A] User role can be modified in user profile','[A] User ID controlled by request parameter','[A] User ID in redirect','[A] URL-based access control bypassed','[P] Method-based access control can be circumvented','[P] Multi-step process with no access control','[P] Referer-based access control','[P] IDOR w/ direct object references','[P] IDOR via insecure direct object references','[E] OAuth — SSRF via referrer'] },
  { id:'ps_upload', name:'File Upload Vulnerabilities', cat:'Server-side', month:'Avril S2',    url:'https://portswigger.net/web-security/file-upload',  labs:['[A] Remote code execution via web shell upload','[A] Web shell upload via Content-Type restriction','[P] Web shell upload via path traversal','[P] Web shell upload via extension blacklist bypass','[P] Web shell upload via obfuscated file extension','[P] Remote code execution via polyglot web shell','[E] Web shell upload via race condition'] },
  { id:'ps_race',   name:'Race Conditions',             cat:'Server-side', month:'Avril S2',    url:'https://portswigger.net/web-security/race-conditions',  labs:['[A] Limit overrun race conditions','[P] Bypassing rate limits via race conditions','[P] Multi-endpoint race conditions','[P] Single-endpoint race conditions','[P] Exploiting time-sensitive vulnerabilities','[E] Partial construction race conditions'] },
  { id:'ps_ssrf',   name:'SSRF',                        cat:'Server-side', month:'Avril S2',    url:'https://portswigger.net/web-security/ssrf',  labs:['[A] Basic SSRF against local server','[A] Basic SSRF against another back-end','[P] SSRF with blacklist-based input filter','[P] SSRF with whitelist-based input filter','[P] SSRF with filter bypass via open redirect','[E] Blind SSRF with out-of-band detection','[E] Blind SSRF with Shellshock exploit'] },
  { id:'ps_xxe',    name:'XXE Injection',               cat:'Server-side', month:'Mai S1',      url:'https://portswigger.net/web-security/xxe',  labs:['[A] File retrieval via XXE','[A] SSRF via XXE','[P] Blind XXE with OOB detection','[P] Blind XXE via XML parameter entities','[P] Blind XXE to exfiltrate data using a malicious DTD','[P] Blind XXE to retrieve data via error messages','[P] Blind XXE by repurposing a local DTD','[P] XXE via XInclude','[E] XXE via image file upload'] },
  { id:'ps_nosql',  name:'NoSQL Injection',             cat:'Server-side', month:'Mai S1',      url:'https://portswigger.net/web-security/nosql-injection',  labs:['[A] Detecting NoSQL injection','[P] Exploiting NoSQL operator injection','[P] Exploiting NoSQL injection to extract data','[E] Exploiting NoSQL injection to extract unknown fields'] },
  { id:'ps_api',    name:'API Testing',                 cat:'Server-side', month:'Mai S2',      url:'https://portswigger.net/web-security/api-testing',  labs:['[A] Exploiting an API endpoint using documentation','[P] Exploiting unused API endpoint','[P] Finding and exploiting an unused API endpoint','[P] Exploiting a mass assignment vulnerability','[E] Exploiting server-side parameter pollution in a REST URL'] },
  { id:'ps_wcd',    name:'Web Cache Deception',         cat:'Server-side', month:'Mai S2',      url:'https://portswigger.net/web-security/web-cache-deception',  labs:['[A] Exploiting path mapping for web cache deception','[P] Exploiting path delimiters for web cache deception','[P] Exploiting origin server normalization for web cache deception','[P] Exploiting CDN normalization for web cache deception','[E] Exploiting exact-match cache rules for web cache deception'] },
  // ── CLIENT-SIDE ──
  { id:'ps_xss',    name:'XSS (Reflected + Stored + DOM)', cat:'Client-side', month:'Juin S1–S2', url:'https://portswigger.net/web-security/cross-site-scripting',  labs:['[A] Reflected XSS into HTML ctx no encoding','[A] Stored XSS into HTML ctx no encoding','[A] DOM XSS in document.write sink','[A] DOM XSS in innerHTML sink','[A] DOM XSS in jQuery anchor href attr','[A] DOM XSS in jQuery selector via hashchange','[A] Reflected XSS into attribute with angle brackets HTML-encoded','[A] Stored XSS into anchor href attribute','[A] Reflected XSS into a JS string w/ angle brackets HTML-encoded','[P] DOM XSS in document.write w/ select element','[P] DOM XSS in AngularJS expression','[P] Reflected DOM XSS','[P] Stored DOM XSS','[P] Reflected XSS into HTML ctx with most tags and attributes blocked','[P] Reflected XSS into HTML ctx with all tags blocked except custom','[P] Reflected XSS with some SVG markup allowed','[P] Reflected XSS in canonical link tag','[P] Reflected XSS into a JS string with single quote and backslash escaped','[P] Reflected XSS into a JS string with angle brackets and double quotes HTML-encoded','[P] Stored XSS into onclick event with angle brackets and double quotes HTML-encoded','[P] Reflected XSS into a template literal','[P] Reflected XSS with event handlers and href attributes blocked','[P] Reflected XSS in a JS URL with some chars blocked','[P] CSP bypass with reflected XSS','[P] Dangling markup injection','[E] Reflected XSS with AngularJS sandbox escape without strings','[E] Reflected XSS with AngularJS sandbox escape and CSP','[E] Reflected XSS protected by very strict CSP with dangling markup attack','[E] Reflected XSS protected by CSP with CSP gadget','[E] DOM XSS with web messages'] },
  { id:'ps_csrf',   name:'CSRF',                        cat:'Client-side', month:'Juil S1',     url:'https://portswigger.net/web-security/csrf',  labs:['[A] CSRF vulnerability with no defenses','[P] CSRF where token validation depends on request method','[P] CSRF where token validation depends on token being present','[P] CSRF where token is not tied to user session','[P] CSRF where token is tied to non-session cookie','[P] CSRF where token is duplicated in cookie','[P] SameSite Lax bypass via method override','[P] SameSite Strict bypass via client-side redirect','[P] SameSite Strict bypass via sibling domain','[P] SameSite Lax bypass via cookie refresh','[P] CSRF where Referer validation depends on header being present','[P] CSRF with broken Referer validation'] },
  { id:'ps_cors',   name:'CORS',                        cat:'Client-side', month:'Juil S1',     url:'https://portswigger.net/web-security/cors',  labs:['[A] CORS vulnerability with basic origin reflection','[P] CORS vulnerability with trusted null origin','[E] CORS vulnerability with trusted insecure protocols'] },
  { id:'ps_click',  name:'Clickjacking',                cat:'Client-side', month:'Juil S1',     url:'https://portswigger.net/web-security/clickjacking',  labs:['[A] Basic clickjacking with CSRF token protection','[A] Clickjacking with form input data prefilled from a URL parameter','[A] Clickjacking with a frame buster script','[P] Exploiting clickjacking vulnerability to trigger DOM-based XSS','[P] Multistep clickjacking'] },
  { id:'ps_dom',    name:'DOM-based Vulnerabilities',   cat:'Client-side', month:'Juil S2',     url:'https://portswigger.net/web-security/dom-based',  labs:['[A] DOM XSS using web messages','[A] DOM XSS using web messages and a JS URL','[A] DOM XSS using web messages and JSON.parse','[P] DOM-based open redirection','[P] DOM-based cookie manipulation','[E] Exploiting DOM clobbering to enable XSS','[E] Clobbering DOM attributes to bypass HTML filters'] },
  { id:'ps_ws',     name:'WebSockets',                  cat:'Client-side', month:'Juil S2',     url:'https://portswigger.net/web-security/websockets',  labs:['[A] Manipulating WebSocket messages','[P] Cross-site WebSocket hijacking','[P] Manipulating the WebSocket handshake'] },
  // ── ADVANCED ──
  { id:'ps_deser',  name:'Insecure Deserialization',    cat:'Advanced',    month:'Août S1',     url:'https://portswigger.net/web-security/deserialization',  labs:['[A] Modifying serialized objects','[P] Modifying serialized data types','[P] Using application functionality to exploit insecure deser','[P] Arbitrary object injection in PHP','[P] Exploiting Java deser with Apache Commons','[P] Exploiting PHP deser with custom gadget chain','[P] Exploiting Ruby deser using a documented gadget chain','[E] Developing a custom gadget chain for PHP deser','[E] Developing a custom gadget chain for Java deser','[E] Using PHAR deser to deploy a custom gadget chain'] },
  { id:'ps_llm',    name:'Web LLM Attacks',             cat:'Advanced',    month:'Août S1',     url:'https://portswigger.net/web-security/llm-attacks',  labs:['[A] Exploiting LLM APIs with excessive agency','[P] Exploiting vulnerabilities in LLM APIs','[P] Indirect prompt injection','[E] Exploiting insecure output handling in LLMs'] },
  { id:'ps_graphql',name:'GraphQL API Vulnerabilities', cat:'Advanced',    month:'Août S2',     url:'https://portswigger.net/web-security/graphql',  labs:['[A] Accessing private GraphQL posts','[P] Accidental exposure of private GraphQL fields','[P] Finding a hidden GraphQL endpoint','[P] Bypassing GraphQL brute force protections','[E] Performing CSRF exploits over GraphQL'] },
  { id:'ps_ssti',   name:'Server-side Template Injection', cat:'Advanced', month:'Août S2',     url:'https://portswigger.net/web-security/server-side-template-injection',  labs:['[A] Basic SSTI','[A] Basic SSTI (code context)','[P] Using documentation to exploit SSTI — FreeMarker','[P] Using documentation to exploit SSTI — Django','[P] Unknown language with a documented exploit','[P] Information disclosure via user-supplied objects','[E] Sandboxed environment with a documented exploit','[E] Custom template language (Python/Jinja2)'] },
  { id:'ps_wcp',    name:'Web Cache Poisoning',         cat:'Advanced',    month:'Sept S1',     url:'https://portswigger.net/web-security/web-cache-poisoning',  labs:['[A] Web cache poisoning with an unkeyed header','[P] Web cache poisoning with an unkeyed cookie','[P] Web cache poisoning with multiple headers','[P] Targeted web cache poisoning using an unknown header','[P] Web cache poisoning via an unkeyed query string','[P] Web cache poisoning via an unkeyed query parameter','[P] Parameter cloaking','[P] Web cache poisoning via a fat GET request','[P] URL normalization','[E] Cache key injection','[E] Internal cache poisoning','[E] Combining web cache poisoning vulnerabilities','[E] Cache poisoning to exploit a DOM vulnerability'] },
  { id:'ps_host',   name:'HTTP Host Header Attacks',    cat:'Advanced',    month:'Sept S1',     url:'https://portswigger.net/web-security/host-header',  labs:['[A] Basic password reset poisoning','[A] Host header authentication bypass','[P] Web cache poisoning via ambiguous requests','[P] Routing-based SSRF','[P] SSRF via flawed request parsing','[P] Host validation bypass via connection state attack','[E] Password reset poisoning via dangling markup'] },
  { id:'ps_smuggl', name:'HTTP Request Smuggling',      cat:'Advanced',    month:'Sept S2',     url:'https://portswigger.net/web-security/request-smuggling',  labs:['[A] HTTP/1 request smuggling — CL.TE','[A] HTTP/1 request smuggling — TE.CL','[P] HTTP request smuggling confirming TE.CL via timing','[P] HTTP request smuggling finding TE.CL using differential responses','[P] Exploiting HTTP request smuggling to bypass access controls','[P] Exploiting HTTP request smuggling to capture other users\' requests','[P] Exploiting HTTP request smuggling to deliver reflected XSS','[P] Response queue poisoning via H2.TE request smuggling','[P] H2.CL request smuggling','[P] HTTP/2 request smuggling via CRLF injection','[P] HTTP/2 request splitting via CRLF injection','[P] CL.0 request smuggling','[E] Bypassing access controls via HTTP/2 request tunnelling','[E] Web cache poisoning via HTTP/2 request tunnelling','[E] Client-side desync','[E] Browser-powered request smuggling','[E] Exploiting HTTP request smuggling to perform web cache poisoning','[E] Exploiting HTTP request smuggling to perform web cache deception','[E] Obfuscating attacks using HTTP/2 request splitting','[E] Exploiting HTTP request smuggling to bypass front-end security controls (TE.CL)','[E] Exploiting HTTP request smuggling to bypass front-end security controls (CL.TE)','[E] Exploiting HTTP request smuggling to reveal front-end request rewriting'] },
  { id:'ps_oauth',  name:'OAuth Authentication',        cat:'Advanced',    month:'Oct S1',      url:'https://portswigger.net/web-security/oauth',  labs:['[A] Authentication bypass via OAuth implicit flow','[P] Forced OAuth profile linking','[P] OAuth account hijacking via redirect_uri','[P] Stealing OAuth access tokens via an open redirect','[E] SSRF via OpenID dynamic client registration','[E] Stealing OAuth access tokens via a proxy page'] },
  { id:'ps_jwt',    name:'JWT Attacks',                 cat:'Advanced',    month:'Oct S1',      url:'https://portswigger.net/web-security/jwt',  labs:['[A] JWT authentication bypass via unverified signature','[A] JWT authentication bypass via flawed signature verification','[P] JWT authentication bypass via weak signing secret','[P] JWT authentication bypass via jwk header injection','[P] JWT authentication bypass via jku header injection','[P] JWT authentication bypass via kid header path traversal','[E] JWT authentication bypass via algorithm confusion','[E] JWT authentication bypass via algorithm confusion without exposed key'] },
  { id:'ps_proto',  name:'Prototype Pollution',         cat:'Advanced',    month:'Oct S2',      url:'https://portswigger.net/web-security/prototype-pollution',  labs:['[A] DOM XSS via client-side prototype pollution','[A] DOM XSS via alternative prototype pollution vector','[P] Client-side prototype pollution via flawed sanitization','[P] Client-side prototype pollution in third-party libraries','[P] Privilege escalation via server-side prototype pollution','[P] Detecting server-side prototype pollution without polluted property reflection','[P] Bypassing flawed input filters for server-side prototype pollution','[E] Remote code execution via server-side prototype pollution','[E] Exfiltrating sensitive data via server-side prototype pollution','[E] DOM XSS via client-side prototype pollution in fetch API'] },
  { id:'ps_skills', name:'Essential Skills',            cat:'Advanced',    month:'Oct S2',      url:'https://portswigger.net/web-security/essential-skills',  labs:['[P] Discovering vulnerabilities quickly with targeted scanning','[P] Scanning non-standard data structures'] },
];
''';

final List<BookTask> bookTasks = _parseBookTasks(_bookTasksSource);
final List<PhrackItem> phrackItems = _parsePhrackItems(_phrackSource);
final List<ArticleItem> baseArticles = _parseArticleItems(_articlesSource);

List<BookTask> _parseBookTasks(String source) {
  final out = <BookTask>[];
  for (final rawLine in source.split('\n')) {
    final line = rawLine.trim();
    if (line.isEmpty || line.startsWith('#')) continue;
    final parts = line.split('|');
    if (parts.length < 4) continue;
    out.add(
      BookTask(
        id: parts[0],
        book: parts[1],
        title: parts[2],
        review: parts[3] == '1',
      ),
    );
  }
  return out;
}

List<PhrackItem> _parsePhrackItems(String source) {
  final out = <PhrackItem>[];
  for (final rawLine in source.split('\n')) {
    final line = rawLine.trim();
    if (line.isEmpty || line.startsWith('#')) continue;
    final parts = line.split('|');
    if (parts.length < 4) continue;
    out.add(
      PhrackItem(
        id: parts[0],
        reference: parts[1],
        title: parts[2],
        when: parts[3],
      ),
    );
  }
  return out;
}

List<ArticleItem> _parseArticleItems(String source) {
  final out = <ArticleItem>[];
  for (final rawLine in source.split('\n')) {
    final line = rawLine.trim();
    if (line.isEmpty || line.startsWith('#')) continue;
    final parts = line.split('|');
    if (parts.length < 5) continue;
    out.add(
      ArticleItem(
        id: parts[0],
        category: parts[1],
        title: parts[2],
        url: parts[3],
        when: parts[4],
      ),
    );
  }
  return out;
}

const String _bookTasksSource = '''
kr1|K&R|Ch.1 review publiee|1
kr2|K&R|Ch.2 review publiee|1
kr3|K&R|Ch.3 review publiee|1
jo1|Jorgensen|Ch.1-2 lus + GDB|0
jo2|Jorgensen|Ch.3-4 lus + GDB|0
jo5|Jorgensen|Review synthese publiee|1
fd3|From Day 0|Ch.3 review publiee|1
fd4|From Day 0|Ch.4 review publiee|1
sl1|Steal Like an Artist|Lu en entier|0
sl2|Steal Like an Artist|Review 400 mots publiee|1
dr1|Drawing on the Right Side|Ch.1-2 + exercices|0
dr3|Drawing on the Right Side|Review bloc 1 publiee|1
''';

const String _phrackSource = '''
phr_1|#49/14|Smashing the Stack for Fun and Profit|Aout 2026
phr_2|#57/9|Vudo - malloc and heap exploitation|Oct 2026
phr_3|Shacham 2007|Geometry of Innocent Flesh on the Bone|Dec 2026
phr_4|#71 PDF|Phrack #71 complete archive read|Phase 3
''';

const String _articlesSource = '''
art_ssrf_1|SSRF|SSRF Complete Guide - Intigriti|https://intigriti.com/researchers/blog/hacking-tools/ssrf|Mars
art_ssrf_2|SSRF|Blind SSRF Chains - Assetnote|https://blog.assetnote.io/2021/01/13/blind-ssrf-chains/|Mars
art_idor_1|IDOR/OAuth|Second Order IDOR Delete - Koalasec|https://blog.koalasec.co/how-a-second-order-idor-lets-you|Mars
art_xss_1|XSS/WAF/CSP|XSS Filter Evasion Bypass - Acunetix|https://acunetix.com/blog/articles/xss-filter-evasion-bypass|Avril
art_xss_2|XSS/WAF/CSP|Do Not Use alert(1) in XSS - LiveOverflow|https://liveoverflow.com/do-not-use-alert-1-in-xss/|Avril
art_client_1|Client-side|Sanitize Client Side - Sonar|https://sonarsource.com/blog/sanitize-client-side-server|Mai
art_fw_1|Frameworks|Next.js Cache Poisoning Black Hole - zhero|https://zhero-web-sec.github.io/research-and-things/nextjs-cache-poisoning-black-hole|Juin
art_misc_1|SQL/Auth/Misc|Rails SQL Injection Gotchas - Edgescan|https://edgescan.com/rails-sql-injection-gotchas/|Avril
art_sast_1|SAST|WTF is AI Native SAST - parsiya.net|https://parsiya.net/blog/wtf-is-ai-native-sast/|Phase 2
art_bb_1|Bug Bounty|RCE in VS Code WSL - parsiya.net|https://parsiya.net/blog/2021-12-20-rce-in-visual-studio-code-wsl/|Phase 1
art_fuzz_1|Fuzzing|Fuzzing WebSockets - aretekzs|https://aretekzs.com/posts/fuzzing-ws/|Phase 1
art_paged_1|Paged Out / Kernel|Paged Out #8 - Data-only Kernel Exploit|https://pagedout.institute/download/PagedOut_008.pdf|Phase 3
''';

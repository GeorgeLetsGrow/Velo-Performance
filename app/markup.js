// Auto-generated from the original index.html body markup.
// Static marketing markup; interactive behavior lives in public/reservation.js.
export const MARKUP = `<!-- ============ NAV ============ -->
<header style="position:sticky;top:0;z-index:50;background:var(--header-bg);backdrop-filter:blur(14px);border-bottom:1px solid var(--border-2)">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px;height:74px;display:flex;align-items:center;justify-content:space-between">
    <a href="#top" style="display:flex;align-items:center;text-decoration:none">
      <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Labs" style="height:66px;width:auto;display:block">
    </a>
    <nav class="velo-desktop-nav" style="display:flex;align-items:center;gap:30px">
      <a href="#programs" class="nav-link" style="font-family:'Barlow Condensed';font-weight:600;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);text-decoration:none">Programs</a>
      <a href="#schedule" class="nav-link" style="font-family:'Barlow Condensed';font-weight:600;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);text-decoration:none">Schedule</a>
      <a href="#coaches" class="nav-link" style="font-family:'Barlow Condensed';font-weight:600;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);text-decoration:none">Coaches</a>
      <a href="#pricing" class="nav-link" style="font-family:'Barlow Condensed';font-weight:600;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);text-decoration:none">Pricing</a>
      <a href="#results" class="nav-link" style="font-family:'Barlow Condensed';font-weight:600;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);text-decoration:none">Results</a>
      <button onclick="toggleTheme()" class="velo-theme-toggle" aria-label="Toggle light and dark theme" title="Toggle light / dark"><span class="theme-icon-moon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></span><span class="theme-icon-sun" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span></button>
      <a href="#register" style="font-family:'Barlow Condensed';font-weight:800;font-size:14px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink);background:var(--accent);padding:11px 20px;text-decoration:none;transform:skewX(-9deg);display:inline-block"><span style="display:inline-block;transform:skewX(9deg)">Reserve a Spot</span></a>
    </nav>
    <div style="display:flex;align-items:center;gap:10px">
      <button onclick="toggleTheme()" class="velo-theme-toggle velo-mobile-toggle" aria-label="Toggle light and dark theme" title="Toggle light / dark"><span class="theme-icon-moon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></span><span class="theme-icon-sun" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span></button>
      <button class="velo-mobile-btn" onclick="toggleMobileMenu()" style="display:none;background:none;border:1px solid var(--border-2);color:var(--text);width:44px;height:44px;cursor:pointer;font-size:18px;align-items:center;justify-content:center">☰</button>
    </div>
  </div>
  <div id="mobileMenu" style="display:none;border-top:1px solid var(--border-2);padding:14px 28px 20px;flex-direction:column;gap:4px;background:var(--bg)">
    <a href="#programs" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-2);text-decoration:none;padding:10px 0;border-bottom:1px solid var(--hairline);display:block">Programs</a>
    <a href="#schedule" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-2);text-decoration:none;padding:10px 0;border-bottom:1px solid var(--hairline);display:block">Schedule</a>
    <a href="#coaches" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-2);text-decoration:none;padding:10px 0;border-bottom:1px solid var(--hairline);display:block">Coaches</a>
    <a href="#pricing" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-2);text-decoration:none;padding:10px 0;border-bottom:1px solid var(--hairline);display:block">Pricing</a>
    <a href="#results" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-2);text-decoration:none;padding:10px 0;border-bottom:1px solid var(--hairline);display:block">Results</a>
    <a href="#register" onclick="closeMobileMenu()" style="font-family:'Barlow Condensed';font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);background:var(--accent);text-align:center;padding:13px 0;text-decoration:none;margin-top:8px;display:block">Reserve a Spot</a>
  </div>
</header>

<!-- ============ HERO ============ -->
<section id="top" style="position:relative;min-height:760px;display:flex;align-items:center;overflow:hidden;border-bottom:1px solid var(--hairline)">
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(118deg,var(--stripe-a),var(--stripe-a) 16px,var(--stripe-b) 16px,var(--stripe-b) 32px)"></div>
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;padding-right:5%;opacity:.5">
    <span style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5);letter-spacing:.1em;border:1px dashed var(--dash);padding:8px 14px">[ HERO PHOTO — athlete mid-swing, low angle ]</span>
  </div>
  <div style="position:absolute;inset:0;background:linear-gradient(100deg,var(--bg) 28%,var(--bg-86) 50%,var(--bg-55) 100%)"></div>
  <div class="velo-hero-inner" style="position:relative;max-width:1240px;margin:0 auto;padding:90px 28px;width:100%">
    <div class="velo-hero-grid" style="display:flex;align-items:center;justify-content:space-between;gap:44px;flex-wrap:wrap">
      <div class="velo-hero-copy" style="flex:1 1 520px;max-width:760px">
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:26px">
        <span style="width:30px;height:2px;background:var(--accent)"></span>
        <span style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.32em;color:var(--accent);text-transform:uppercase">After School Development</span>
      </div>
      <h1 style="font-family:'Anton';font-weight:400;font-size:clamp(54px,8vw,118px);line-height:.9;letter-spacing:.005em;text-transform:uppercase;color:var(--text);text-wrap:balance">
        Train Different.<br>Train Smarter.<br><span style="color:var(--accent)">Be Elite.</span>
      </h1>
      <p style="margin-top:26px;font-size:20px;line-height:1.5;color:var(--text-2);max-width:520px;font-weight:500">
        Real coaching. Small groups. Big results. A player development program for baseball and softball athletes in Apollo Beach, FL — not daycare.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:38px">
        <a href="#register" class="velo-btn velo-btn-primary" style="font-family:'Barlow Condensed';font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);background:var(--accent);padding:17px 32px;text-decoration:none;transform:skewX(-9deg);display:inline-block"><span style="display:inline-block;transform:skewX(9deg)">Reserve a Spot →</span></a>
        <a href="#programs" class="velo-btn velo-btn-ghost" style="font-family:'Barlow Condensed';font-weight:700;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--text);background:transparent;border:1.5px solid var(--border-strong);padding:17px 30px;text-decoration:none;transform:skewX(-9deg);display:inline-block"><span style="display:inline-block;transform:skewX(9deg)">See the Program</span></a>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0;margin-top:54px;border:1px solid var(--border-2);background:var(--stat-bg);width:fit-content">
        <div style="flex:1;padding:16px 20px;border-right:1px solid var(--border-2)">
          <div style="font-family:'Anton';font-size:23px;color:var(--gold);line-height:1.2;text-transform:uppercase;white-space:nowrap">Small Groups</div>
          <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:4px">Personalized Coaching</div>
        </div>
        <div style="flex:1;padding:16px 20px;border-right:1px solid var(--border-2)">
          <div style="font-family:'Anton';font-size:23px;color:var(--text);line-height:1.2;text-transform:uppercase;white-space:nowrap">Mon–Fri</div>
          <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:4px">Flexible Scheduling</div>
        </div>
        <div style="flex:1;padding:16px 20px">
          <div style="font-family:'Anton';font-size:23px;color:var(--text);line-height:1.2;text-transform:uppercase;white-space:nowrap">After School</div>
          <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:4px">Training Until 5PM</div>
        </div>
      </div>
      </div>
      <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Labs" class="velo-hero-logo" style="width:min(560px,48vw);height:auto;display:block;flex-shrink:0">
    </div>
  </div>
</section>

<!-- ============ MARQUEE BAND ============ -->
<div style="background:var(--accent);overflow:hidden;padding:16px 0;border-bottom:1px solid var(--ink)">
  <div style="display:flex;width:max-content;animation:veloMarquee 26s linear infinite">
    <div style="display:flex;align-items:center;gap:28px;padding-right:28px">
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Not Daycare. Player Development.</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Small Groups</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Individual Coaching</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Real Results</span><span style="color:var(--ink);font-size:14px">●</span>
    </div>
    <div style="display:flex;align-items:center;gap:28px;padding-right:28px" aria-hidden="true">
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Not Daycare. Player Development.</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Small Groups</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Individual Coaching</span><span style="color:var(--ink);font-size:14px">●</span>
      <span style="font-family:'Anton';font-size:24px;text-transform:uppercase;color:var(--ink);letter-spacing:.02em">Real Results</span><span style="color:var(--ink);font-size:14px">●</span>
    </div>
  </div>
</div>

<!-- ============ PROGRAM OVERVIEW ============ -->
<section id="programs" style="background:var(--bg);padding:104px 0">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap;margin-bottom:54px">
      <div style="max-width:640px">
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:16px">01 / The Program</div>
        <h2 style="font-family:'Anton';font-size:clamp(38px,5vw,64px);line-height:.95;text-transform:uppercase;color:var(--text)">Every Afternoon Builds a Better Athlete</h2>
      </div>
      <p style="max-width:340px;color:var(--text-3);font-size:16px;line-height:1.6">Six development pillars, coached every single day. Baseball and softball players train with intent — not just reps.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1px;background:var(--border);border:1px solid var(--border)">
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-01</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="6" r="2.4"/><path d="M15 9 L4.5 19.5"/><path d="M4.5 19.5 L3 21"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Hitting Instruction</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Mechanics, bat path, and approach — built rep by rep with real feedback.</p>
      </div>
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-02</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M6.5 5.5 C9 8.5 9 15.5 6.5 18.5"/><path d="M17.5 5.5 C15 8.5 15 15.5 17.5 18.5"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Pitching Instruction</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Arm care, command, and velocity development with mound-specific coaching.</p>
      </div>
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-03</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 v3 a4 4 0 0 0 4 4 h5 a4 4 0 0 0 4-4 v-3"/><path d="M5 12 V8"/><path d="M9 12 V5.5"/><path d="M13 12 V5.5"/><path d="M17 12 V8"/><path d="M9 19 a3 3 0 0 1 3-3 a3 3 0 0 1 3 3"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Defensive Training</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Footwork, glove work, and game-speed reads for every position.</p>
      </div>
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-04</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L4 13.5 h6 l-1 8.5 L19 10.5 h-6 z"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Speed · Agility · Strength</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Athletic foundation work — explosiveness, mobility, and durability.</p>
      </div>
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-05</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.6" fill="var(--bg)"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Baseball &amp; Softball IQ</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Situational awareness and decision-making that wins games.</p>
      </div>
      <div class="pillar-card" style="background:var(--bg-1);padding:36px 32px;position:relative">
        <div style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5)">P-06</div>
        <div style="width:48px;height:48px;margin:18px 0 22px;background:var(--accent);display:flex;align-items:center;justify-content:center;transform:skewX(-9deg)"><span style="display:flex;transform:skewX(9deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 6"/><polyline points="15 6 21 6 21 12"/></svg></span></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:24px;letter-spacing:.02em;text-transform:uppercase;color:var(--text);line-height:1.05">Weekly Progress Tracking</h3>
        <p style="margin-top:12px;color:var(--text-3);font-size:15px;line-height:1.6">Measured development so athletes and parents see real movement.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ SMALL GROUPS ============ -->
<section style="position:relative;background:var(--bg-2);padding:0;border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);overflow:hidden">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div class="velo-nine-grid" style="display:grid;grid-template-columns:1.05fr 1fr;min-height:520px;border-left:1px solid var(--border);border-right:1px solid var(--border)">
      <div style="display:flex;flex-direction:column;justify-content:center;padding:72px 44px">
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase;margin-bottom:20px">02 / Why It Works</div>
        <div style="max-width:480px">
          <h2 style="font-family:'Anton';font-size:clamp(30px,3.4vw,44px);line-height:.98;text-transform:uppercase;color:var(--text)">Small Groups. Big Results.<br><span style="color:var(--accent)">Quality Over Quantity.</span></h2>
          <p style="margin-top:18px;color:var(--text-2);font-size:17px;line-height:1.6">Every session is designed to maximize development — not maximize attendance. We intentionally keep our training groups small so every athlete gets more coaching, more reps, and more opportunities to improve.</p>
          <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:22px">
            <span style="display:inline-flex;align-items:center;gap:8px;font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:var(--text)"><span style="color:var(--accent);font-weight:700">▸</span>More coaching</span>
            <span style="display:inline-flex;align-items:center;gap:8px;font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:var(--text)"><span style="color:var(--accent);font-weight:700">▸</span>More reps</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:24px">
            <span style="width:9px;height:9px;border-radius:50%;background:var(--accent);animation:veloPulse 1.6s ease-in-out infinite"></span>
            <span style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.14em;color:var(--text-2);text-transform:uppercase">Spots fill fast — reserve early</span>
          </div>
        </div>
      </div>
      <div style="position:relative;min-height:360px;background:repeating-linear-gradient(126deg,var(--stripe-c),var(--stripe-c) 15px,var(--bg-3) 15px,var(--bg-3) 30px);display:flex;align-items:center;justify-content:center;border-left:1px solid var(--border);overflow:hidden">
        <img src="/assets/nine-athletes.png" alt="Coach working with a small group of young athletes" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">
        <img src="/assets/nine-athletes-2.png" alt="" aria-hidden="true" class="velo-slide-top" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(12,12,13,.55),rgba(12,12,13,0) 38%)"></div>
        <div style="position:absolute;bottom:26px;left:26px;right:26px;display:flex;gap:8px">
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
          <div style="flex:1;height:5px;background:var(--accent);opacity:.9"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ SCHEDULE ============ -->
<section id="schedule" style="background:var(--bg);padding:104px 0">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="margin-bottom:54px;max-width:680px">
      <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:16px">03 / The Afternoon</div>
      <h2 style="font-family:'Anton';font-size:clamp(38px,5vw,64px);line-height:.95;text-transform:uppercase;color:var(--text)">Structured. Purposeful. Fun.</h2>
      <p style="margin-top:18px;color:var(--text-3);font-size:17px;line-height:1.6">Every afternoon is built around intentional development. Athletes rotate through skill instruction, competitive drills, athletic performance training, and game play — all in a structured environment that keeps them engaged from drop-off until 5:00pm.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px">
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">01</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Dynamic Warm-Up</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Movement preparation and athletic development to get ready to perform.</p>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">02</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Skill Development</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Hitting, pitching, fielding, catching, and position-specific instruction.</p>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">03</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Competitive Training</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Games, challenges, and live situations that teach athletes how to compete.</p>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">04</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Performance Training</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Speed, agility, coordination, throwing mechanics, and baseball movement.</p>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">05</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Game Play</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Apply what was learned in fun, competitive environments that reinforce good habits.</p>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:30px 26px">
        <div style="font-family:'JetBrains Mono';font-size:13px;color:var(--gold);letter-spacing:.1em">06</div>
        <div style="width:40px;height:3px;background:var(--accent);margin:18px 0 16px"></div>
        <h3 style="font-family:'Barlow Condensed';font-weight:800;font-size:21px;text-transform:uppercase;letter-spacing:.02em;color:var(--text);line-height:1.1">Team Culture</h3>
        <p style="margin-top:10px;color:var(--text-3);font-size:14.5px;line-height:1.55">Encouragement, accountability, and confidence-building every single day.</p>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:30px">
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg-1);border:1px solid var(--border);padding:14px 20px">
        <span style="font-family:'Anton';font-size:18px;color:var(--accent)">↻</span>
        <span style="font-family:'Barlow Condensed';font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:var(--text-2)">Weekly progress tracking for every athlete</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg-1);border:1px solid var(--border);padding:14px 20px">
        <span style="font-family:'Anton';font-size:18px;color:var(--accent)">⚲</span>
        <span style="font-family:'Barlow Condensed';font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:var(--text-2)">Apollo Beach, FL</span>
      </div>
    </div>
  </div>
</section>

<!-- ============ COACHES ============ -->
<section id="coaches" style="background:var(--bg-2);padding:104px 0;border-top:1px solid var(--hairline)">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap;margin-bottom:48px">
      <div style="max-width:640px">
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:16px">04 / The Staff</div>
        <h2 style="font-family:'Anton';font-size:clamp(38px,5vw,64px);line-height:.95;text-transform:uppercase;color:var(--text)">Coached By Players Who've Been There</h2>
      </div>
      <p style="max-width:340px;color:var(--text-3);font-size:16px;line-height:1.6">Former college and pro talent with decades of youth development. Real experience, hands-on every afternoon.</p>
    </div>
    <div class="velo-coach-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div style="background:var(--bg);border:1px solid var(--border);overflow:hidden">
        <img src="/assets/coach-neril.png" alt="Coach Neril Griffith" style="width:100%;height:auto;display:block">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-top:1px solid var(--border);flex-wrap:wrap">
          <div>
            <div style="font-family:'Barlow Condensed';font-weight:800;font-size:20px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Coach Neril Griffith</div>
            <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:var(--text-4);margin-top:3px">HITTING · DEFENSE · DEVELOPMENT</div>
          </div>
          <div style="font-family:'Barlow Condensed';font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)">30+ Yrs</div>
        </div>
      </div>
      <div style="background:var(--bg);border:1px solid var(--border);overflow:hidden">
        <img src="/assets/coach-nevin.png" alt="Coach Nevin Griffith" style="width:100%;height:auto;display:block">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-top:1px solid var(--border);flex-wrap:wrap">
          <div>
            <div style="font-family:'Barlow Condensed';font-weight:800;font-size:20px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Coach Nevin Griffith</div>
            <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:var(--text-4);margin-top:3px">PITCHING · VELOCITY · MENTAL GAME</div>
          </div>
          <div style="font-family:'Barlow Condensed';font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)">100+ MPH</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PRICING ============ -->
<section id="pricing" style="background:var(--bg-2);padding:104px 0;border-top:1px solid var(--hairline)">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="text-align:center;margin-bottom:54px">
      <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:16px">05 / Flexible Options</div>
      <h2 style="font-family:'Anton';font-size:clamp(38px,5vw,64px);line-height:.95;text-transform:uppercase;color:var(--text)">Train Your Way</h2>
      <p style="margin-top:16px;color:var(--text-3);font-size:17px;max-width:520px;margin-left:auto;margin-right:auto">Flexible scheduling. Elite coaching. Every session delivers the same high standard of player development.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:stretch">
      <!-- Drop-In -->
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:38px 32px;position:relative;display:flex;flex-direction:column">
        <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3)">Drop-In</div>
        <div style="display:flex;align-items:flex-start;gap:4px;margin:18px 0 6px">
          <span style="font-family:'Anton';font-size:30px;color:var(--text);padding-top:8px">$</span>
          <span style="font-family:'Anton';font-size:72px;line-height:.85;color:var(--text)">60</span>
        </div>
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.1em;color:var(--text-4);text-transform:uppercase">Per Day</div>
        <p style="margin-top:18px;color:var(--text-3);font-size:15px;line-height:1.55;min-height:44px">Perfect for busy schedules, extra reps, or experiencing the Velo difference.</p>
        <div style="height:1px;border-top:1px solid var(--border-2);margin:22px 0"></div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:30px">
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>High-energy training session</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Individual coaching &amp; feedback</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Game-ready skill development</span></li>
        </ul>
        <a href="#register" style="margin-top:auto;text-align:center;font-family:'Barlow Condensed';font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;padding:15px;text-decoration:none;color:var(--text);background:transparent;border:1.5px solid var(--border-strong);display:block">Book a Drop-In</a>
      </div>
      <!-- Flex Pass (featured) -->
      <div style="background:var(--bg-3);border:1px solid var(--accent);padding:38px 32px;position:relative;display:flex;flex-direction:column">
        <div style="position:absolute;top:0;right:0;background:var(--accent);color:var(--ink);font-family:'Barlow Condensed';font-weight:800;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:7px 14px">Most Popular</div>
        <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">3-Day Flex Pass</div>
        <div style="display:flex;align-items:flex-start;gap:4px;margin:18px 0 6px">
          <span style="font-family:'Anton';font-size:30px;color:var(--text);padding-top:8px">$</span>
          <span style="font-family:'Anton';font-size:72px;line-height:.85;color:var(--text)">150</span>
        </div>
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.1em;color:var(--text-4);text-transform:uppercase">Per Week</div>
        <p style="margin-top:18px;color:var(--text-3);font-size:15px;line-height:1.55;min-height:44px">Perfect for multi-sport athletes and busy families. Train any 3 days Monday–Friday with the flexibility your family needs while receiving the same elite coaching every session.</p>
        <div style="height:1px;border-top:1px solid var(--border-2);margin:22px 0"></div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:30px">
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Choose any 3 afternoons each week</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Small-group coaching &amp; personalized instruction</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Maximum development. Flexible commitment.</span></li>
        </ul>
        <a href="#register" style="margin-top:auto;text-align:center;font-family:'Barlow Condensed';font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;padding:15px;text-decoration:none;color:var(--ink);background:var(--accent);border:1.5px solid var(--accent);display:block">Get the Flex Pass</a>
      </div>
      <!-- Unlimited -->
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:38px 32px;position:relative;display:flex;flex-direction:column">
        <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)">Unlimited Week</div>
        <div style="display:flex;align-items:flex-start;gap:4px;margin:18px 0 6px">
          <span style="font-family:'Anton';font-size:30px;color:var(--text);padding-top:8px">$</span>
          <span style="font-family:'Anton';font-size:72px;line-height:.85;color:var(--text)">175</span>
        </div>
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.1em;color:var(--text-4);text-transform:uppercase">Per Week</div>
        <p style="margin-top:18px;color:var(--text-3);font-size:15px;line-height:1.55;min-height:44px">The fastest path to consistent improvement. Train Monday through Friday for the athlete committed to reaching their full potential.</p>
        <div style="height:1px;border-top:1px solid var(--border-2);margin:22px 0"></div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:30px">
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Unlimited training, Monday–Friday</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>Maximum coaching, reps &amp; development</span></li>
          <li style="display:flex;align-items:flex-start;gap:10px;color:var(--text-2);font-size:14.5px;line-height:1.4"><span style="color:var(--accent);font-weight:700;flex-shrink:0">▸</span><span>The fastest path to consistent improvement</span></li>
        </ul>
        <a href="#register" style="margin-top:auto;text-align:center;font-family:'Barlow Condensed';font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;padding:15px;text-decoration:none;color:var(--text);background:transparent;border:1.5px solid var(--border-strong);display:block">Start Training</a>
      </div>
    </div>
    <p style="text-align:center;margin-top:28px;font-family:'JetBrains Mono';font-size:12px;letter-spacing:.1em;color:var(--text-5)">LIMITED DAILY ENROLLMENT · MONDAY–FRIDAY</p>
  </div>
</section>

<!-- ============ WHAT EACH AFTERNOON INCLUDES ============ -->
<section style="background:var(--bg);padding:104px 0">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div class="velo-split" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
      <div>
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:16px">06 / Inside the Lab</div>
        <h2 style="font-family:'Anton';font-size:clamp(34px,4.4vw,56px);line-height:.95;text-transform:uppercase;color:var(--text)">What Every Afternoon Includes</h2>
        <p style="margin-top:18px;color:var(--text-3);font-size:17px;line-height:1.6;max-width:440px">Coached movement, real reps, and accountability. No filler, no standing around.</p>
        <div style="display:flex;flex-direction:column;gap:1px;margin-top:34px;background:var(--border);border:1px solid var(--border)">
          <div class="include-row" style="background:var(--bg-1);padding:20px 24px;display:flex;align-items:center;gap:18px">
            <span style="font-family:'Anton';font-size:18px;color:var(--gold);min-width:34px">01</span>
            <div><div style="font-family:'Barlow Condensed';font-weight:700;font-size:18px;letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Coached Skill Work</div><div style="color:var(--text-3);font-size:14px;margin-top:2px">Hands-on instruction every rep — never solo reps.</div></div>
          </div>
          <div class="include-row" style="background:var(--bg-1);padding:20px 24px;display:flex;align-items:center;gap:18px">
            <span style="font-family:'Anton';font-size:18px;color:var(--gold);min-width:34px">02</span>
            <div><div style="font-family:'Barlow Condensed';font-weight:700;font-size:18px;letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Live Feedback</div><div style="color:var(--text-3);font-size:14px;margin-top:2px">Real-time correction so habits stick the right way.</div></div>
          </div>
          <div class="include-row" style="background:var(--bg-1);padding:20px 24px;display:flex;align-items:center;gap:18px">
            <span style="font-family:'Anton';font-size:18px;color:var(--gold);min-width:34px">03</span>
            <div><div style="font-family:'Barlow Condensed';font-weight:700;font-size:18px;letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Athletic Development</div><div style="color:var(--text-3);font-size:14px;margin-top:2px">Speed, agility, and strength built into the block.</div></div>
          </div>
          <div class="include-row" style="background:var(--bg-1);padding:20px 24px;display:flex;align-items:center;gap:18px">
            <span style="font-family:'Anton';font-size:18px;color:var(--gold);min-width:34px">04</span>
            <div><div style="font-family:'Barlow Condensed';font-weight:700;font-size:18px;letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Game IQ Reps</div><div style="color:var(--text-3);font-size:14px;margin-top:2px">Situations and reads that translate to the diamond.</div></div>
          </div>
          <div class="include-row" style="background:var(--bg-1);padding:20px 24px;display:flex;align-items:center;gap:18px">
            <span style="font-family:'Anton';font-size:18px;color:var(--gold);min-width:34px">05</span>
            <div><div style="font-family:'Barlow Condensed';font-weight:700;font-size:18px;letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Progress Notes</div><div style="color:var(--text-3);font-size:14px;margin-top:2px">Tracked weekly so growth is visible, not guessed.</div></div>
          </div>
        </div>
      </div>
      <div style="position:relative;background:var(--bg);border:1px solid var(--border);overflow:hidden;display:flex">
        <img src="/assets/team-card.png" alt="Velo Performance Labs team card" style="width:100%;height:auto;display:block">
        <div style="position:absolute;top:20px;left:20px;background:var(--accent);color:var(--ink);font-family:'Barlow Condensed';font-weight:800;font-size:13px;letter-spacing:.1em;text-transform:uppercase;padding:8px 14px;transform:skewX(-9deg);box-shadow:0 4px 16px rgba(0,0,0,.45)"><span style="display:inline-block;transform:skewX(9deg)">Baseball + Softball</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ CHAMPIONS BOARD ============ -->
<section style="background:var(--bg);padding:96px 0 40px">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:34px;flex-wrap:wrap">
      <span style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase">Champions Board</span>
      <span style="flex:1;min-width:40px;height:1px;background:var(--border)"></span>
      <span style="font-family:'Barlow Condensed';font-weight:800;font-size:clamp(22px,3vw,34px);letter-spacing:.02em;text-transform:uppercase;color:var(--text)">Real Athletes. Real Wins.</span>
    </div>
    <div class="velo-gallery" style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div style="background:var(--bg-2);border:1px solid var(--border);overflow:hidden">
        <img src="/assets/champ-leo.png" alt="Leo — Long Toss Champion" style="width:100%;height:auto;display:block">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-top:1px solid var(--border);flex-wrap:wrap">
          <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Leo · Long Toss Champ</div>
          <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:var(--accent)">FARTHEST THROW ON TARGET</div>
        </div>
      </div>
      <div style="background:var(--bg-2);border:1px solid var(--border);overflow:hidden">
        <img src="/assets/champ-nixon.png" alt="Nixon — Exit Velo Champion" style="width:100%;height:auto;display:block">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-top:1px solid var(--border);flex-wrap:wrap">
          <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Nixon · Exit Velo Champ</div>
          <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:var(--accent)">50.1 MPH · WEEK 2</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PARENT PROOF ============ -->
<section id="results" style="background:var(--bg-2);padding:104px 0;border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline)">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div style="text-align:center;margin-bottom:54px">
      <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase;margin-bottom:16px">07 / The Proof</div>
      <h2 style="font-family:'Anton';font-size:clamp(38px,5vw,64px);line-height:.95;text-transform:uppercase;color:var(--text)">The Velo Difference</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);margin-bottom:44px">
      <div style="background:var(--bg-1);padding:34px 28px;text-align:center">
        <div style="font-family:'Anton';font-size:clamp(40px,5vw,58px);color:var(--accent);line-height:.9">12:1</div>
        <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:12px">Max Athletes Per Session</div>
      </div>
      <div style="background:var(--bg-1);padding:34px 28px;text-align:center">
        <div style="font-family:'Anton';font-size:clamp(40px,5vw,58px);color:var(--accent);line-height:.9">5 Days</div>
        <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:12px">Flexible Training</div>
      </div>
      <div style="background:var(--bg-1);padding:34px 28px;text-align:center">
        <div style="font-family:'Anton';font-size:clamp(40px,5vw,58px);color:var(--accent);line-height:.9">100%</div>
        <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:12px">Coach-Led Instruction</div>
      </div>
      <div style="background:var(--bg-1);padding:34px 28px;text-align:center">
        <div style="font-family:'Anton';font-size:clamp(40px,5vw,58px);color:var(--accent);line-height:.9">Weekly</div>
        <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.14em;color:var(--text-4);text-transform:uppercase;margin-top:12px">Progress Tracking</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:32px 30px;display:flex;flex-direction:column">
        <div style="font-family:'Anton';font-size:42px;color:var(--accent);line-height:.6;height:24px">"</div>
        <p style="color:var(--text-2);font-size:16.5px;line-height:1.6;font-weight:500;flex:1">The small group is everything. My son actually gets coached every rep — his swing changed in weeks, not months.</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed';font-weight:800;color:var(--gold);font-size:16px">MR</div>
          <div>
            <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Marcus R.</div>
            <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.1em;color:var(--text-4)">PARENT · 12U BASEBALL</div>
          </div>
        </div>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:32px 30px;display:flex;flex-direction:column">
        <div style="font-family:'Anton';font-size:42px;color:var(--accent);line-height:.6;height:24px">"</div>
        <p style="color:var(--text-2);font-size:16.5px;line-height:1.6;font-weight:500;flex:1">Finally an after-school option that's real training, not babysitting. She comes home tired and proud.</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed';font-weight:800;color:var(--gold);font-size:16px">JT</div>
          <div>
            <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">Jenna T.</div>
            <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.1em;color:var(--text-4)">PARENT · 10U SOFTBALL</div>
          </div>
        </div>
      </div>
      <div style="background:var(--bg-1);border:1px solid var(--border);padding:32px 30px;display:flex;flex-direction:column">
        <div style="font-family:'Anton';font-size:42px;color:var(--accent);line-height:.6;height:24px">"</div>
        <p style="color:var(--text-2);font-size:16.5px;line-height:1.6;font-weight:500;flex:1">The weekly tracking keeps him accountable. He sees the progress, so he wants to keep showing up.</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed';font-weight:800;color:var(--gold);font-size:16px">DL</div>
          <div>
            <div style="font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.03em;text-transform:uppercase;color:var(--text)">David L.</div>
            <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.1em;color:var(--text-4)">PARENT · 14U BASEBALL</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ REGISTRATION CTA ============ -->
<section id="register" style="position:relative;background:var(--bg);padding:0;overflow:hidden">
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(118deg,var(--stripe-a),var(--stripe-a) 16px,var(--stripe-b) 16px,var(--stripe-b) 32px);opacity:.6"></div>
  <div style="position:relative;max-width:1240px;margin:0 auto;padding:104px 28px">
    <div style="background:var(--accent);padding:clamp(44px,6vw,80px);position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-10px;font-family:'Anton';font-size:clamp(100px,16vw,230px);color:rgba(12,12,13,.12);line-height:.7;pointer-events:none">VELO</div>
      <div style="position:relative;max-width:720px">
        <div style="font-family:'JetBrains Mono';font-size:12px;letter-spacing:.3em;color:rgba(12,12,13,.7);text-transform:uppercase;margin-bottom:20px">Register Now · Apollo Beach, FL</div>
        <h2 style="font-family:'Anton';font-size:clamp(40px,6vw,82px);line-height:.9;text-transform:uppercase;color:var(--ink)">Ready to Level Up? Reserve Your Spot!</h2>
        <p style="margin-top:22px;font-size:19px;line-height:1.5;color:rgba(12,12,13,.78);font-weight:600;max-width:540px">Small-group training means enrollment is intentionally limited. Send us your info and we'll reach out to confirm your athlete's spot.</p>
        <form name="reserve-a-spot" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field" style="margin-top:32px;max-width:620px">
          <input type="hidden" name="form-name" value="reserve-a-spot">
          <p style="display:none" aria-hidden="true"><label>Don't fill this out if you're human: <input name="bot-field"></label></p>
          <div class="velo-form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div>
              <label for="rf-name" class="velo-form-label">Parent Name *</label>
              <input id="rf-name" name="parent-name" type="text" required autocomplete="name" class="velo-input">
            </div>
            <div>
              <label for="rf-email" class="velo-form-label">Email *</label>
              <input id="rf-email" name="email" type="email" required autocomplete="email" class="velo-input">
            </div>
            <div>
              <label for="rf-phone" class="velo-form-label">Phone</label>
              <input id="rf-phone" name="phone" type="tel" autocomplete="tel" class="velo-input">
            </div>
            <div>
              <label for="rf-interest" class="velo-form-label">Interested In</label>
              <select id="rf-interest" name="interest" class="velo-input">
                <option>Drop-In — $60 / day</option>
                <option>3-Day Flex Pass — $150 / week</option>
                <option>Unlimited Week — $175 / week</option>
                <option>Not sure yet — just have questions</option>
              </select>
            </div>
            <div style="grid-column:1 / -1">
              <label for="rf-message" class="velo-form-label">Athlete's age &amp; anything we should know</label>
              <textarea id="rf-message" name="message" rows="3" class="velo-input" style="resize:vertical"></textarea>
            </div>
            <div style="grid-column:1 / -1;display:flex;align-items:flex-start;gap:10px;margin-top:2px">
              <input type="checkbox" id="rf-sms-optin" name="sms-opt-in" value="yes" style="margin-top:3px;width:17px;height:17px;flex-shrink:0;accent-color:#0c0c0d;cursor:pointer">
              <label for="rf-sms-optin" style="font-family:'Barlow',sans-serif;font-size:13px;line-height:1.5;color:rgba(12,12,13,.78);cursor:pointer">I agree to receive text messages from Velo Performance Labs about my reservation. Message &amp; data rates may apply. Reply STOP to opt out anytime.</label>
            </div>
          </div>
          <button type="submit" class="velo-form-submit" style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);background:var(--bg);padding:18px 36px;border:none;cursor:pointer;margin-top:18px">Reserve Your Spot →</button>
          <p style="margin-top:14px;font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:rgba(12,12,13,.6);text-transform:uppercase">We confirm every request personally before a spot is locked in</p>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer style="background:var(--bg-footer);padding:72px 0 36px;border-top:1px solid var(--hairline)">
  <div style="max-width:1240px;margin:0 auto;padding:0 28px">
    <div class="velo-footer-grid" style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px;padding-bottom:48px;border-bottom:1px solid var(--hairline)">
      <div>
        <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Labs" style="height:124px;width:auto;display:block;margin:-12px 0 14px -8px">
        <p style="color:var(--text-4);font-size:15px;line-height:1.6;max-width:300px">After-school player development for baseball and softball athletes. Train different. Train smarter. Be elite.</p>
      </div>
      <div>
        <div style="font-family:'Barlow Condensed';font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--text);margin-bottom:18px">Visit</div>
        <div style="color:var(--text-3);font-size:15px;line-height:1.9">Apollo Beach, FL<br>Monday – Friday<br>After school until 5:00 PM</div>
      </div>
      <div>
        <div style="font-family:'Barlow Condensed';font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--text);margin-bottom:18px">Get Started</div>
        <div style="display:flex;flex-direction:column;gap:11px">
          <a href="#register" class="footer-link" style="color:var(--text-3);font-size:15px;text-decoration:none">Reserve a Spot</a>
          <a href="#pricing" class="footer-link" style="color:var(--text-3);font-size:15px;text-decoration:none">View Pricing</a>
          <a href="#programs" class="footer-link" style="color:var(--text-3);font-size:15px;text-decoration:none">Programs</a>
          <span style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-5);margin-top:6px">[ phone / email / form link ]</span>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding-top:28px">
      <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.1em;color:var(--text-5)">© 2026 VELO PERFORMANCE LABS · APOLLO BEACH, FL</div>
      <div style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.14em;color:var(--accent);text-transform:uppercase">Not Daycare. Player Development.</div>
    </div>
  </div>
</footer>`;

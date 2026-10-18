/* ========================================================
   SHARED OVERLAYS / MODALS
   --------------------------------------------------------
   This markup (tips, account/auth, my saves, global
   leaderboard, OG Bio generator, share, "how this works",
   and roast-share overlays) used to be pasted as static HTML
   into every page (index.html, roast.html, compare.html,
   gamecard.html, leaderboard.html, championship.html)
   -- identical, word for word, on all seven. It now lives
   here once and gets injected right where that static block
   used to sit, with the exact same ids and structure, so
   auth.js / script.js / save.js / saves.js / leaderboard.js
   keep working without any changes to them.

   This is also the one complete, up to date copy: it
   includes the "check your email to confirm" step in the
   auth modal (#auth-view-confirm) that index.html and
   leaderboard.html were missing before this refactor --
   sign-up on those two pages now shows the same confirmation
   screen as every other page.

   Loaded as a plain <script src> (no async/defer), so it
   runs synchronously while the page is still parsing -- the
   overlay elements exist in the DOM before the very next
   script tag (auth.js) runs, exactly like when this was
   static markup sitting in the page.
   ======================================================== */
(function () {
  "use strict";
  var html = `
<!-- ============ TIPS OVERLAY ============ -->
<div id="tips-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-labelledby="tips-title">
  <div class="share-panel tips-panel">
    <p class="kicker tips-kicker">// level up your @</p>
    <h3 id="tips-title" class="tips-title">tips for better usernames</h3>
    <ol class="tips-list mono">
      <li>Keep it short &amp; simple.</li>
      <li>Make it easy to remember.</li>
      <li>Avoid unnecessary numbers.</li>
      <li>Don't overuse underscores.</li>
      <li>Keep the spelling easy.</li>
      <li>Make it match your vibe.</li>
      <li>Avoid too many special characters.</li>
      <li>Make it easy to say out loud.</li>
      <li>Keep it unique.</li>
      <li>Think long-term before choosing.</li>
    </ol>
    <button type="button" id="tips-close" class="share-close">close</button>
  </div>
</div>

<!-- ============ ACCOUNT / SIGN UP / LOG IN OVERLAY ============ -->
<div id="auth-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-label="Account">
  <div class="share-panel auth-panel">
    <button type="button" id="auth-close-x" class="ogbio-close-x" aria-label="Close account panel">×</button>

    <!-- guest state: sign up / log in form -->
    <div id="auth-view-form" class="auth-view">
      <p class="kicker auth-kicker">// your account</p>
      <h3 id="auth-title" class="auth-title">log in</h3>
      <p class="auth-sub" id="auth-sub">optional — you can keep rating as a guest, no account needed.</p>

      <form id="auth-form" autocomplete="on" novalidate>
        <div class="input-row auth-input-row">
          <input id="auth-email" class="mono" type="email" placeholder="email" autocomplete="email" aria-label="email" />
        </div>
        <div class="input-row auth-input-row">
          <input id="auth-password" class="mono" type="password" placeholder="password" autocomplete="current-password" aria-label="password" minlength="6" />
        </div>
        <p id="auth-error" class="error-msg auth-error" role="alert"></p>
        <button type="submit" id="auth-submit-btn" class="btn btn-primary auth-submit-btn">log in →</button>
      </form>

      <p class="auth-switch mono">
        <span id="auth-switch-text">new here?</span>
        <button type="button" id="auth-switch-btn" class="btn-ghost">sign up</button>
      </p>
    </div>

    <!-- post sign-up state: email confirmation required (Supabase returned a user with no session) -->
    <div id="auth-view-confirm" class="auth-view auth-confirm" hidden aria-live="polite">
      <div class="auth-confirm-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="4 12.5 9.5 18 20 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="kicker auth-kicker">// one more step</p>
      <h3 class="auth-title">check your email.</h3>
      <p class="auth-sub">we sent a confirmation link to your email. click it to activate your account.</p>
      <p class="auth-confirm-email mono" id="auth-confirm-email">your@email.com</p>
      <p class="auth-confirm-guide mono">open your inbox → confirm → come back here</p>
      <button type="button" id="auth-confirm-back-btn" class="btn-ghost auth-confirm-back">← back to sign up</button>
    </div>

    <!-- signed-in state: account summary + logout -->
    <div id="auth-view-account" class="auth-view" hidden>
      <p class="kicker auth-kicker">// signed in</p>
      <h3 class="auth-title">you're in <span aria-hidden="true">✅</span></h3>
      <p class="auth-sub" id="auth-account-email">—</p>
      <p class="auth-account-note">rate a username to claim your spot on the global leaderboard.</p>
      <div class="auth-account-actions">
        <button type="button" id="auth-leaderboard-btn" class="btn btn-outline auth-my-saves-btn">🏆 leaderboard</button>
        <button type="button" id="auth-my-saves-btn" class="btn btn-outline auth-my-saves-btn">📁 my saves</button>
        <button type="button" id="auth-logout-btn" class="btn btn-outline auth-logout-btn">log out</button>
      </div>
    </div>
  </div>
</div>

<!-- ============ MY SAVES OVERLAY (additive, rest of site untouched) ============ -->
<div id="saves-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-labelledby="saves-title">
  <div class="share-panel saves-panel">
    <button type="button" id="saves-close-x" class="ogbio-close-x" aria-label="Close my saves">×</button>

    <p class="kicker auth-kicker">// your saves</p>
    <h3 id="saves-title" class="auth-title">my saves</h3>

    <div id="saves-loading" class="saves-state" hidden>
      <p class="loading-text mono show">loading your saves...</p>
    </div>

    <div id="saves-error" class="saves-state" hidden>
      <p class="auth-sub" id="saves-error-text">couldn't load your saves — try again.</p>
      <button type="button" id="saves-retry-btn" class="btn btn-outline">retry →</button>
    </div>

    <div id="saves-empty" class="saves-state" hidden>
      <p class="auth-sub">no saved results yet.</p>
      <p class="auth-account-note">rate, roast, or build a gamecard for your @ and hit save — it'll show up here.</p>
    </div>

    <div id="saves-list" class="saves-list" hidden></div>
  </div>
</div>

<!-- ============ GLOBAL LEADERBOARD OVERLAY (additive, rest of site untouched) ============ -->
<div id="leaderboard-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-labelledby="lb-title">
  <div class="share-panel leaderboard-panel">
    <button type="button" id="lb-close-x" class="ogbio-close-x" aria-label="Close leaderboard">×</button>

    <p class="kicker lb-kicker">// who's actually tuff?</p>
    <h3 id="lb-title" class="lb-title">global leaderboard 🏆</h3>
    <p class="lb-tagline">your username vs everyone else.</p>

    <!-- guest state -->
    <div id="lb-locked" class="lb-locked" hidden>
      <span class="lb-locked-emoji" aria-hidden="true">🔒</span>
      <h4 class="lb-locked-title">unlock the leaderboard</h4>
      <p class="lb-locked-sub">sign in to see where your @ actually lands — free, takes a few seconds.</p>
      <div class="lb-locked-actions">
        <button type="button" id="lb-locked-signup" class="btn btn-primary">sign up →</button>
        <button type="button" id="lb-locked-login" class="btn btn-outline">log in</button>
      </div>
    </div>

    <!-- loading state -->
    <div id="lb-loading" class="lb-state" hidden>
      <p class="loading-text mono show">pulling up the rankings...</p>
      <div class="lb-skeleton" aria-hidden="true">
        <div class="lb-skeleton-row"></div>
        <div class="lb-skeleton-row"></div>
        <div class="lb-skeleton-row"></div>
        <div class="lb-skeleton-row"></div>
      </div>
    </div>

    <!-- error state -->
    <div id="lb-error" class="lb-state" hidden>
      <p class="auth-sub" id="lb-error-text">couldn't load the leaderboard — try again.</p>
      <button type="button" id="lb-retry-btn" class="btn btn-outline">retry →</button>
    </div>

    <!-- empty state (no entries yet at all) -->
    <div id="lb-empty" class="lb-state" hidden>
      <span class="lb-empty-emoji" aria-hidden="true">🏁</span>
      <p class="auth-sub">no one's on the board yet.</p>
      <p class="auth-account-note">rate your username to be the very first name up there.</p>
    </div>

    <!-- signed-in state: ranked list -->
    <div id="lb-content" class="lb-content" hidden>
      <p id="lb-no-entry-note" class="lb-nudge" hidden>
        <span>rate your username to claim your spot 🚀</span>
      </p>
      <div id="lb-your-rank-bar" class="lb-your-rank-bar" hidden>
        <div class="lb-your-rank-info">
          <span class="lb-your-rank-num mono" id="lb-your-rank-num">#—</span>
          <span class="lb-your-rank-score mono" id="lb-your-rank-score">—/100</span>
        </div>
        <button type="button" id="lb-jump-btn" class="lb-jump-btn">jump to me ↓</button>
      </div>
      <div id="lb-list" class="lb-list"></div>
    </div>
  </div>
</div>

<!-- ============ GET OG BIO OVERLAY ============ -->
<div id="ogbio-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-labelledby="ogbio-title">
  <div class="share-panel ogbio-panel">
    <button type="button" id="ogbio-close-x" class="ogbio-close-x" aria-label="Close get OG bio">×</button>

    <!-- STEP 1: identity select -->
    <div class="ogbio-step" id="ogbio-step-identity" data-step="identity">
      <p class="kicker ogbio-kicker">Get OG Bio's 🗿</p>
      <h3 id="ogbio-title" class="ogbio-title">Select Your Identity</h3>
      <p class="ogbio-sub">Choose what fits you best.</p>

      <div class="identity-grid" id="identity-grid" role="listbox" aria-label="Select your identity">
        <button type="button" class="identity-card" data-identity="gamer" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">🎮</span>
          <span class="identity-label">Gamer</span>
        </button>
        <button type="button" class="identity-card" data-identity="creator" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">🎨</span>
          <span class="identity-label">Creator</span>
        </button>
        <button type="button" class="identity-card" data-identity="social" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">📱</span>
          <span class="identity-label">Social</span>
        </button>
        <button type="button" class="identity-card" data-identity="memelord" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">😂</span>
          <span class="identity-label">Meme Lord</span>
        </button>
        <button type="button" class="identity-card" data-identity="music" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">🎧</span>
          <span class="identity-label">Music</span>
        </button>
        <button type="button" class="identity-card" data-identity="justme" role="option" aria-selected="false">
          <span class="identity-emoji" aria-hidden="true">✨</span>
          <span class="identity-label">Just Me</span>
        </button>
      </div>

      <button type="button" id="ogbio-continue" class="btn btn-primary ogbio-continue" disabled>continue →</button>
    </div>

    <!-- STEP 2: generated bio result -->
    <div class="ogbio-step" id="ogbio-step-next" data-step="next" hidden>
      <p class="kicker ogbio-kicker">Fresh Bio's -&gt;</p>
      <h3 class="ogbio-title">your og bio 🗿</h3>
      <p class="ogbio-sub" id="ogbio-selected-summary">you picked: —</p>
      <div class="ogbio-result-box mono" id="ogbio-result-box">
        <p id="ogbio-bio-text" class="ogbio-bio-text">—</p>
        <div id="ogbio-bio-loading" class="ogbio-bio-loading" aria-hidden="true">
          <span class="ogbio-dot"></span>
          <span class="ogbio-dot"></span>
          <span class="ogbio-dot"></span>
        </div>
      </div>
      <div class="ogbio-btn-row">
        <button type="button" id="ogbio-regenerate" class="btn btn-primary ogbio-regenerate">regenerate ↻</button>
        <button type="button" id="ogbio-copy" class="btn btn-outline ogbio-copy">copy</button>
      </div>
      <button type="button" id="ogbio-use-gamecard" class="btn btn-primary ogbio-use-gamecard" hidden>✨ Use This Bio in GameCard →</button>
      <button type="button" id="ogbio-back" class="btn btn-ghost">← back to identities</button>
    </div>

    <button type="button" id="ogbio-close" class="share-close">close</button>
  </div>
</div>

<!-- ============ SHARE OVERLAY ============ -->
<div id="share-overlay" class="share-overlay">
  <div class="share-panel">
    <canvas id="share-canvas" width="640" height="800"></canvas>
    <div class="share-actions">
      <button type="button" id="share-download" class="btn btn-outline share">download ↓</button>
      <button type="button" id="share-native" class="btn btn-outline" style="display:none;">share…</button>
    </div>
    <button type="button" id="share-close" class="share-close">close</button>
  </div>
</div>

<!-- ============ CHAMPIONSHIP: HOW THIS WORKS OVERLAY ============ -->
<div id="champ-how-overlay" class="share-overlay" role="dialog" aria-modal="true" aria-labelledby="champ-how-title">
  <div class="share-panel champ-how-panel">
    <button type="button" id="champ-how-close-x" class="ogbio-close-x" aria-label="Close how this works">×</button>
    <h3 id="champ-how-title" class="tips-title">How this works <span aria-hidden="true">🏆</span></h3>
    <ol class="tips-list mono">
      <li>Enter 2 usernames and battle them.</li>
      <li>The winner advances.</li>
      <li>Enter 2 more usernames for the second battle.</li>
      <li>Both winners face each other in the semifinal.</li>
      <li>The final winner becomes the Ultimate Username Champion <span aria-hidden="true">🏆</span></li>
    </ol>
  </div>
</div>

<!-- ============ 💀 ROAST SHARE OVERLAY ============ -->
<div id="roast-share-overlay" class="share-overlay">
  <div class="share-panel">
    <canvas id="roast-share-canvas" width="640" height="800"></canvas>
    <div class="share-actions">
      <button type="button" id="roast-share-download" class="btn btn-outline share">download ↓</button>
      <button type="button" id="roast-share-native" class="btn btn-outline" style="display:none;">share…</button>
    </div>
    <button type="button" id="roast-share-close" class="share-close">close</button>
  </div>
</div>
`;
  if (document.currentScript) {
    document.currentScript.insertAdjacentHTML("beforebegin", html);
  } else {
    // Extremely old-browser fallback: still works, just appends
    // at the end of body instead of in place.
    document.body.insertAdjacentHTML("beforeend", html);
  }
})();

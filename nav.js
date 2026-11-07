!function(){"use strict";var t,e=["go-home","champ-go-home","gc-go-home","gc-poster-go-home","roast-go-home","ogbio-go-home","tool-rate"],n={"compare.html":"cmp-input-1","roast.html":"roast-input","gamecard.html":"gc-name","championship.html":"champ-input-1"};t=function(){var t=location.pathname.split("/").pop()||"index.html";if("index.html"!==t&&e.forEach(function(t){var e=document.getElementById(t);e&&e.addEventListener("click",function(t){t.preventDefault(),t.stopImmediatePropagation(),window.location.href="index.html"},!0)}),document.querySelectorAll(".site-nav-link").forEach(function(e){(e.getAttribute("href")||"").split("/").pop()===t&&(e.classList.add("is-current"),e.setAttribute("aria-current","page"))}),n[t]&&window.addEventListener("load",function(){var e=document.getElementById(n[t]);e&&setTimeout(function(){e.focus()},60)}),"leaderboard.html"===t){var o=!1;function a(){if(!o){var t=document.getElementById("leaderboard-toggle");t&&!t.hidden&&(o=!0,t.click())}}window.__RMU_AUTH_STATE__&&window.__RMU_AUTH_STATE__.ready?setTimeout(a,30):window.addEventListener("rmu:auth-ready",function(){setTimeout(a,30)})}if("gamecard.html"===t){var i=new URLSearchParams(location.search).get("ogbio");if(i){var s=document.getElementById("gc-bio");s&&(s.value=i,s.dispatchEvent(new Event("input",{bubbles:!0})));var l=new URL(location.href);l.searchParams.delete("ogbio"),history.replaceState({},"",l.pathname+l.search+l.hash)}}},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",t):t()}();
/* Hamburger menu drawer */
(function(){
  "use strict";
  var btn = document.getElementById("menu-btn");
  var overlay = document.getElementById("menu-drawer-overlay");
  var closeBtn = document.getElementById("menu-drawer-close");
  if (!btn || !overlay) return;
  function openDrawer(){
    overlay.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer(){
    overlay.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  btn.addEventListener("click", function(){
    overlay.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  closeBtn && closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", function(e){
    if (e.target === overlay) closeDrawer();
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && overlay.classList.contains("open")) closeDrawer();
  });
  overlay.querySelectorAll(".menu-drawer-link").forEach(function(link){
    link.addEventListener("click", closeDrawer);
  });
  overlay.querySelectorAll(".menu-drawer-link").forEach(function(link){
    try {
      if (link.pathname === location.pathname) link.classList.add("is-current");
    } catch (e) {}
  });
})();
(function(){
  "use strict";
  var a = document.getElementById("auth-toggle");
  if (a) {
    a.addEventListener("click", function(){
      window.location.href = "signup/signin.html";
    });
  }
})();

(function(){
  "use strict";
  function patchOpenAuthModal(){
    if (window.RMUAuth) {
      window.RMUAuth.openAuthModal = function(){
        window.location.href = "signup/signin.html";
      };
    }
  }
  if (window.__RMU_AUTH_STATE__ && window.__RMU_AUTH_STATE__.ready) {
    patchOpenAuthModal();
  } else {
    window.addEventListener("rmu:auth-ready", patchOpenAuthModal);
  }
})();

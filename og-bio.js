!function(){"use strict";
var identityCards = Array.from(document.querySelectorAll(".identity-card"));
var continueBtn = document.getElementById("ogbio-continue");
var backBtn = document.getElementById("ogbio-back");
var stepIdentity = document.getElementById("ogbio-step-identity");
var stepNext = document.getElementById("ogbio-step-next");
var selectedSummary = document.getElementById("ogbio-selected-summary");
var regenerateBtn = document.getElementById("ogbio-regenerate");
var copyBtn = document.getElementById("ogbio-copy");
var bioText = document.getElementById("ogbio-bio-text");
var useGamecardBtn = document.getElementById("ogbio-use-gamecard");
if (!stepIdentity || !stepNext) return;

var identityLabels = {gamer:"🎮 Gamer",creator:"🎨 Creator",social:"📱 Social",memelord:"😂 Meme Lord",music:"🎧 Music",justme:"✨ Just Me"};
var bioLines = {gamer:["Not for everyone, exactly how I like it.","Main character energy, side character patience.","Living quiet, moving smart, staying unbothered.","Some things are better left unexplained.","Not lost, just taking the long way.","Soft spoken, hard to read, easy to love.","Chasing peace more than I chase clout.","Certain things just aren't meant for everyone.","Built my own lane, still adding lanes.","Low profile, high standards, no explanations.","Not everything in my life deserves a caption.","Here for the story, not the spotlight.","Growing in silence, glowing without warning.","Not competing, just quietly outlasting everyone.","Some chapters just aren't for the timeline.","Calm exterior, chaotic playlist, honest heart.","Doing my own thing, no commentary needed.","Mysterious by choice, not by accident.","Still figuring it out, still winning quietly.","Energy speaks louder than any caption could.","Not chasing trends, just chasing better days.","Present but private, that's the whole vibe.","Some things you just have to witness.","Living proof that quiet can be loud.","Not lost in the noise, just above it."],creator:["Building ideas that shouldn't exist","Creating more, explaining less","Turning random ideas into real things","Just creating and figuring it out","Building quietly, growing loudly","Ideas today, projects tomorrow","Creating things people actually use","Making the internet a little more fun","One idea away from something big","Creating my own little corner online","Turning imagination into digital things","Making stuff instead of just scrolling","Small creator, big ideas","Creating because why not","Building things I wish existed","Documenting the journey, not the destination","Ideas, edits, uploads, repeat","Creating things worth sharing","Just here to make cool stuff","Building in public, learning every day","From random thoughts to real projects","Creating my way through the internet","Less consuming, more creating","Currently turning ideas into reality","Making something out of nothing"],social:["Just here for good vibes","Making memories, not excuses","Somewhere between online and offline","Good energy, better company","Living life one moment at a time","Here for the moments worth remembering","Collecting memories, not followers","Just vibing through life","Making every moment count","Good people, good times, good energy","Offline life hits different","Currently making memories","A little chaos, a lot of fun","Keeping life interesting","Here for the fun of it","Just enjoying the little things","Making moments worth posting","Life feels better with good company","Somewhere between plans and adventures","Just another day, another memory","Good vibes are always welcome","Living beyond the screen","Finding fun in ordinary days","Making memories along the way","Just here to enjoy the ride"],memelord:["Professional overthinker, part-time meme dealer","My humor needs a software update","Born to meme, forced to behave","Running entirely on memes and bad decisions","Life is temporary, memes are forever","I came, I saw, I memed","Currently accepting memes as emotional support","Making jokes nobody asked for","My personality is basically random memes","Certified yapper with questionable humor","Too funny for my own algorithm","Probably laughing at something completely stupid","Turning everyday problems into premium memes","Humor level: should probably be concerning","I take memes more seriously than life","Just another victim of internet humor","My brain has seventeen tabs open","Professional screenshot collector and meme enthusiast","Serving memes with absolutely zero context","If confused, just add a meme","Making the timeline slightly more chaotic","Fluent in sarcasm, memes, and nonsense","My humor left the group chat","Creating problems just to make memes","Here to make the internet slightly worse"],music:["Living life one song at a time","Headphones on, world completely off","My playlist knows me better than anyone","Currently lost somewhere inside my playlist","Music speaks where words simply cannot","Collecting songs, memories, and late-night thoughts","Every mood deserves its own soundtrack","Probably listening to music right now","Life sounds better with headphones on","Finding myself somewhere between songs","My playlist changes with my personality","Emotionally attached to fictional music moments","Turning ordinary moments into movie soundtracks","Music first, everything else can wait","Just vibing somewhere between beats and lyrics","One playlist, a thousand different moods","Late nights, loud music, endless thoughts","My headphones are basically my personality","Living between melodies and random thoughts","If lost, check my current playlist","Making memories with every song","My mood has a background soundtrack","Music is my favorite kind of escape","Press play and let everything disappear","Somewhere between reality and my headphones"],justme:["Just being myself, nothing more, nothing less","Doing my thing at my own pace","Just me, figuring life out","No bio needed, just vibes","Keeping it simple, keeping it real","Just another chapter of my story","Being myself is more than enough","Nothing special, just uniquely me","Living life my own way","Just existing and enjoying the journey","A work in progress, always","Quietly becoming who I want to be","Just me doing me","No explanations, just my energy","Making my own rules along the way","Somewhere between dreams and reality","Taking life one moment at a time","Still figuring things out, honestly","Just here, being completely myself","Becoming better without becoming someone else","My vibe, my rules, my story","Simply me, with a little chaos","Learning, growing, and enjoying the ride","Nothing to prove, just here to live","Just me, and that's the whole story"]};
var comingSoon = "Coming soon 🚧";
var selectedIdentity = null;
var lastIndex = -1;
var fromGamecard = new URLSearchParams(window.location.search).get("from") === "gamecard";

function hasLines(identity) {
  var lines = bioLines[identity];
  return Array.isArray(lines) && lines.length > 0;
}

function pickLine(identity) {
  var lines = bioLines[identity];
  if (!lines || !lines.length) return comingSoon;
  if (lines.length < 2) return lines[0];
  var idx = lastIndex;
  while (idx === lastIndex) idx = Math.floor(Math.random() * lines.length);
  lastIndex = idx;
  return lines[idx];
}

function generate() {
  var isComingSoon = !hasLines(selectedIdentity);
  var resultBox = document.getElementById("ogbio-result-box");
  var loadingEl = document.getElementById("ogbio-bio-loading");

  function finish() {
    if (bioText) bioText.textContent = isComingSoon ? comingSoon : pickLine(selectedIdentity);
    if (resultBox) resultBox.classList.toggle("is-coming-soon", isComingSoon);
    if (regenerateBtn) regenerateBtn.hidden = isComingSoon;
    if (copyBtn) copyBtn.hidden = isComingSoon;
    if (copyBtn) { copyBtn.classList.remove("is-copied"); copyBtn.textContent = "copy"; }
    if (useGamecardBtn) {
      useGamecardBtn.hidden = isComingSoon || !fromGamecard;
      useGamecardBtn.classList.remove("is-used");
      useGamecardBtn.textContent = "✨ Use This Bio in GameCard →";
    }
  }

  if (isComingSoon) { finish(); return; }

  if (resultBox) resultBox.classList.add("is-loading");
  if (regenerateBtn) regenerateBtn.disabled = true;
  if (loadingEl) loadingEl.setAttribute("aria-hidden", "false");

  var delay = 500 + 500 * Math.random();
  window.setTimeout(function () {
    finish();
    if (resultBox) resultBox.classList.remove("is-loading");
    if (regenerateBtn) regenerateBtn.disabled = false;
    if (loadingEl) loadingEl.setAttribute("aria-hidden", "true");
  }, delay);
}

identityCards.forEach(function (card) {
  card.addEventListener("click", function () {
    identityCards.forEach(function (c) { c.setAttribute("aria-selected", "false"); });
    card.setAttribute("aria-selected", "true");
    selectedIdentity = card.getAttribute("data-identity");
    if (continueBtn) continueBtn.disabled = false;
  });
});

if (continueBtn) continueBtn.addEventListener("click", function () {
  if (!selectedIdentity) return;
  if (selectedSummary) selectedSummary.textContent = "you picked: " + (identityLabels[selectedIdentity] || selectedIdentity);
  stepIdentity.hidden = true;
  stepNext.hidden = false;
  stepNext.scrollIntoView({ behavior: "smooth", block: "start" });
  generate();
});

if (regenerateBtn) regenerateBtn.addEventListener("click", generate);

if (copyBtn) copyBtn.addEventListener("click", function () {
  var text = bioText ? bioText.textContent : "";
  if (text && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      copyBtn.textContent = "copied ✓";
      copyBtn.classList.add("is-copied");
      setTimeout(function () { copyBtn.textContent = "copy"; copyBtn.classList.remove("is-copied"); }, 1500);
    }).catch(function () {});
  }
});

if (backBtn) backBtn.addEventListener("click", function () {
  stepNext.hidden = true;
  stepIdentity.hidden = false;
  stepIdentity.scrollIntoView({ behavior: "smooth", block: "start" });
});

if (useGamecardBtn) useGamecardBtn.addEventListener("click", function () {
  var text = bioText ? bioText.textContent : "";
  if (!text || text === comingSoon) return;
  window.location.href = "gamecard.html?ogbio=" + encodeURIComponent(text);
});
}();

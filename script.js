/* =============================================================
   SurTaal — script.js (V4)
   Premium pass: everything below now talks to BOTH the mini
   now-playing bar AND the full-screen expanded player at once,
   using shared classes (.now-title, .play-pause-btn, etc.)
   instead of single IDs, so the two stay in sync automatically.
   All UI-facing text is in English now.
   ============================================================= */

const YT_API_KEY = "AIzaSyD0cDCx2O-GkCqoqPuQFWl4wRd2Uu__eK8";

// ---------- ICONS ----------
const ICONS = {
  search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sliders: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><circle cx="15" cy="6" r="2" fill="currentColor" stroke="none"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="9" cy="12" r="2" fill="currentColor" stroke="none"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="16" cy="18" r="2" fill="currentColor" stroke="none"/></svg>`,
  info: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  heart: `<svg class="icon icon-heart" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.5-10-9.5C0.5 7 2.5 3 6.5 3c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4 4.5 8.5C19.5 16.5 12 21 12 21z"/></svg>`,
  share: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/></svg>`,
  shuffle: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
  repeat: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  repeatOne: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="16" font-size="8" fill="currentColor" stroke="none" text-anchor="middle" font-family="sans-serif">1</text></svg>`,
  skipPrev: `<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor"/><line x1="5" y1="19" x2="5" y2="5"/></svg>`,
  skipNext: `<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  play: `<svg class="icon" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/></svg>`,
  pause: `<svg class="icon" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  trash: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  music: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  clock: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>`,
  list: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  sun: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  volume: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  externalLink: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  radio: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M8.5 8.5a5 5 0 0 1 7 7"/><path d="M15.5 15.5a5 5 0 0 1-7-7"/><path d="M5.5 5.5a9 9 0 0 1 13 13"/><path d="M18.5 18.5a9 9 0 0 1-13-13"/></svg>`,
  mic: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  home: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>`,
  chevronDown: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 21 6 15"/><polyline points="18 9 12 15 6 9"/></svg>`,
};

// ---------- SMALL DOM HELPERS (ek call se mini + expanded dono update) ----------
function setAllText(selector, text) {
  document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
}
function setAllHTML(selector, html) {
  document.querySelectorAll(selector).forEach((el) => { el.innerHTML = html; });
}
function toggleAllClass(selector, className, on) {
  document.querySelectorAll(selector).forEach((el) => { el.classList.toggle(className, on); });
}
function onAllClick(selector, handler) {
  document.querySelectorAll(selector).forEach((el) => el.addEventListener("click", handler));
}

// ---------- GLOBAL STATE ----------
let player = null;
let currentQueue = [];
let currentIndex = -1;
let currentContext = { type: "home" };
let shuffleOn = false;
let repeatMode = "off"; // "off" | "all" | "one"
let searchMode = "music"; // "music" | "podcast"

let playlists = JSON.parse(localStorage.getItem("surtaal_playlists")) || {};
let favorites = JSON.parse(localStorage.getItem("surtaal_favorites")) || [];
let recentlyPlayed = JSON.parse(localStorage.getItem("surtaal_recent")) || [];

const MOODS = [
  { label: "Bollywood Hits", query: "bollywood hit songs" },
  { label: "Sad Songs", query: "sad hindi songs" },
  { label: "Romantic", query: "romantic hindi songs" },
  { label: "Party & Item Songs", query: "item songs bollywood" },
  { label: "Lo-fi Chill", query: "lofi chill songs" },
  { label: "Devotional", query: "bhakti bhajan songs" },
  { label: "Retro Classics", query: "old bollywood classic songs" },
  { label: "Workout", query: "workout gym songs" },
  { label: "Punjabi", query: "punjabi hit songs" },
  { label: "English Pop", query: "english pop hits" },
];

// ---------- TOAST ----------
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

// ---------- MODALS ----------
function openModal(id) { document.getElementById(id).hidden = false; }
function closeModal(id) { document.getElementById(id).hidden = true; }

function showInputModal(title, defaultValue = "") {
  return new Promise((resolve) => {
    const modal = document.getElementById("inputModal");
    const field = document.getElementById("inputModalField");
    document.getElementById("inputModalTitle").textContent = title;
    field.value = defaultValue;
    modal.hidden = false;
    field.focus();

    const confirmBtn = document.getElementById("inputModalConfirm");
    function cleanup(result) {
      modal.hidden = true;
      confirmBtn.removeEventListener("click", onConfirm);
      field.removeEventListener("keypress", onKeyPress);
      resolve(result);
    }
    function onConfirm() { cleanup(field.value.trim() || null); }
    function onKeyPress(e) { if (e.key === "Enter") onConfirm(); }
    confirmBtn.addEventListener("click", onConfirm);
    field.addEventListener("keypress", onKeyPress);
  });
}

function showConfirmModal(title) {
  return new Promise((resolve) => {
    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModal").hidden = false;
    const yesBtn = document.getElementById("confirmModalYes");
    const noBtn = document.getElementById("confirmModalNo");
    function cleanup(result) {
      document.getElementById("confirmModal").hidden = true;
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
      resolve(result);
    }
    function onYes() { cleanup(true); }
    function onNo() { cleanup(false); }
    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}

// ---------- EXPANDED PLAYER (tap the mini bar to open) ----------
document.querySelector(".now-playing-bar").addEventListener("click", (e) => {
  if (e.target.closest("button, input")) return;
  document.getElementById("expandedPlayer").hidden = false;
});
document.getElementById("collapseBtn").addEventListener("click", () => {
  document.getElementById("expandedPlayer").hidden = true;
});

// ---------- THEME (accent) & MODE (light/dark) ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("surtaal_theme", theme);
}
function applyMode(mode) {
  document.documentElement.setAttribute("data-mode", mode);
  localStorage.setItem("surtaal_mode", mode);
  document.getElementById("modeToggle").innerHTML = mode === "light" ? ICONS.moon : ICONS.sun;
}

// ---------- STATIC ICONS ----------
function renderStaticIcons() {
  document.getElementById("brandIcon").innerHTML = ICONS.music;
  document.getElementById("settingsBtn").innerHTML = ICONS.sliders;
  document.getElementById("aboutBtn").innerHTML = ICONS.info;
  document.getElementById("searchBtn").innerHTML = ICONS.search + "<span>Search</span>";

  document.getElementById("homeBtn").innerHTML = ICONS.home + "<span>Home</span>";
  document.getElementById("favoritesBtn").innerHTML = ICONS.heart + "<span>Favorites</span>";
  document.getElementById("recentBtn").innerHTML = ICONS.clock + "<span>Recently Played</span>";
  document.getElementById("queueBtn").innerHTML = ICONS.list + "<span>Queue</span>";
  document.getElementById("newPlaylistBtn").innerHTML = ICONS.plus;
  document.getElementById("volumeIcon").innerHTML = ICONS.volume;
  document.getElementById("collapseBtn").innerHTML = ICONS.chevronDown;

  document.querySelectorAll(".modal-close").forEach((b) => (b.innerHTML = ICONS.x));

  const musicPill = document.querySelector('.mode-pill[data-mode-type="music"]');
  const podcastPill = document.querySelector('.mode-pill[data-mode-type="podcast"]');
  if (musicPill) musicPill.innerHTML = ICONS.music + "<span>Music</span>";
  if (podcastPill) podcastPill.innerHTML = ICONS.mic + "<span>Podcasts</span>";

  // Yeh sab now-playing wale controls hain — dono jagah (mini bar + expanded view) hain,
  // isliye querySelectorAll se EK saath dono mein icon bhar rahe hain.
  setAllHTML(".play-pause-btn", ICONS.play);
  setAllHTML(".prev-btn", ICONS.skipPrev);
  setAllHTML(".next-btn", ICONS.skipNext);
  setAllHTML(".shuffle-btn", ICONS.shuffle);
  setAllHTML(".repeat-btn", ICONS.repeat);
  setAllHTML(".fav-btn", ICONS.heart);
  setAllHTML(".share-btn", ICONS.share);
  setAllHTML(".radio-btn", ICONS.radio + "<span>Radio</span>");
  setAllHTML(".lyrics-btn", ICONS.externalLink + "<span>Lyrics</span>");
}

// ---------- YOUTUBE PLAYER ----------
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    playerVars: { playsinline: 1 },
    events: { onStateChange: onPlayerStateChange, onError: onPlayerError },
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    setAllHTML(".play-pause-btn", ICONS.pause);
    toggleAllClass(".now-thumb", "is-playing", true);
    startProgressUpdater();
  } else {
    setAllHTML(".play-pause-btn", ICONS.play);
    toggleAllClass(".now-thumb", "is-playing", false);
  }
  if (event.data === YT.PlayerState.ENDED) playNext();
}

function onPlayerError() {
  setAllText(".now-title", "This song can't be embedded — trying the next one...");
  setTimeout(playNext, 800);
}

// ---------- SEARCH ----------
async function searchSongs() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  currentContext = { type: "search" };
  setHomeExtrasVisible(false);
  document.getElementById("sectionTitle").textContent = `Results for "${query}"`;
  document.getElementById("emptyHint").textContent = "Tap any song — it'll start playing instantly.";

  const categoryParam = searchMode === "podcast" ? "" : "&videoCategoryId=10";
  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    `?part=snippet&type=video&maxResults=16${categoryParam}` +
    `&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      showToast("There's a problem with the API key — check Step 3 in GUIDE.md");
      return;
    }

    currentQueue = (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: decodeHTML(item.snippet.title),
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    renderSongGrid(currentQueue);
  } catch (err) {
    console.error(err);
    showToast("Check your internet connection — something went wrong");
  }
}

function decodeHTML(text) {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// ---------- RENDER SONG GRID ----------
function renderSongGrid(songs) {
  const container = document.getElementById("resultsContainer");
  container.innerHTML = "";

  if (songs.length === 0) {
    container.innerHTML = `<p class="empty-hint">Nothing here yet.</p>`;
    return;
  }

  const playingSong = currentIndex >= 0 ? currentQueue[currentIndex] : null;
  const sameList = songs === currentQueue;

  songs.forEach((song, index) => {
    const isFav = favorites.some((f) => f.id === song.id);
    const isPlaying = sameList && playingSong && index === currentIndex;

    let extraButton = `<button data-action="addlist" data-id="${song.id}" title="Add to playlist">${ICONS.plus}</button>`;
    if (currentContext.type === "playlist") {
      extraButton = `<button data-action="removefromplaylist" data-id="${song.id}" title="Remove from playlist">${ICONS.x}</button>`;
    } else if (currentContext.type === "queue") {
      extraButton = `<button data-action="removefromqueue" data-index="${index}" title="Remove from queue">${ICONS.x}</button>`;
    }

    const card = document.createElement("div");
    card.className = "song-card" + (isPlaying ? " is-active" : "");
    card.dataset.index = index;
    card.tabIndex = 0;
    card.style.animationDelay = Math.min(index * 0.03, 0.4) + "s";
    card.innerHTML = `
      <div class="song-thumb-wrap">
        <img src="${song.thumbnail}" alt="${song.title}">
        ${isPlaying ? `<div class="eq-badge"><span></span><span></span><span></span></div>` : ""}
      </div>
      <div class="song-title">${song.title}</div>
      <div class="song-channel" data-action="artist" data-channel="${song.channel}">${song.channel}</div>
      <div class="card-actions">
        <button data-action="fav" data-id="${song.id}" class="${isFav ? "is-fav" : ""}" title="Favorite">${ICONS.heart}</button>
        ${extraButton}
      </div>
    `;
    container.appendChild(card);
  });
}

function refreshCurrentView() { renderSongGrid(currentQueue); }

document.getElementById("resultsContainer").addEventListener("click", (e) => {
  const specific = e.target.closest("[data-action]");
  if (specific) {
    const action = specific.dataset.action;
    if (action === "fav") { toggleFavoriteById(specific.dataset.id); refreshCurrentView(); return; }
    if (action === "addlist") { showPlaylistPicker(specific.dataset.id); return; }
    if (action === "removefromplaylist") { removeFromPlaylist(currentContext.name, specific.dataset.id); return; }
    if (action === "removefromqueue") { removeFromQueue(Number(specific.dataset.index)); return; }
    if (action === "artist") {
      document.getElementById("searchInput").value = specific.dataset.channel;
      searchSongs();
      return;
    }
  }
  const card = e.target.closest(".song-card");
  if (card) playFromQueue(Number(card.dataset.index));
});

document.getElementById("resultsContainer").addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("song-card")) {
    e.preventDefault();
    playFromQueue(Number(e.target.dataset.index));
  }
});

// ---------- PLAYBACK ----------
function playFromQueue(index) {
  currentIndex = index;
  playSong(currentQueue[index]);
}

function playSong(song) {
  if (!player || !player.loadVideoById) {
    showToast("Player is still loading — try again in a moment");
    return;
  }
  player.loadVideoById(song.id);
  player.playVideo();

  setAllText(".now-title", song.title);
  setAllText(".now-channel", song.channel);
  document.querySelectorAll(".now-thumb").forEach((img) => { img.src = song.thumbnail; img.hidden = false; });
  document.getElementById("npGlow").style.backgroundImage = `url(${song.thumbnail})`;
  document.getElementById("expGlow").style.backgroundImage = `url(${song.thumbnail})`;

  document.querySelectorAll(".seek-bar").forEach((b) => { b.value = 0; });
  setAllText(".cur-time", "0:00");
  setAllText(".dur-time", "0:00");

  updateFavIcon(song.id);
  logRecentlyPlayed(song);
  refreshCurrentView();
}

function togglePlayPause() {
  if (!player || !player.getPlayerState) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
}

function playNext() {
  if (currentQueue.length === 0) return;

  if (repeatMode === "one") { playSong(currentQueue[currentIndex]); return; }

  if (shuffleOn && currentQueue.length > 1) {
    let nextIndex;
    do { nextIndex = Math.floor(Math.random() * currentQueue.length); }
    while (nextIndex === currentIndex);
    currentIndex = nextIndex;
    playSong(currentQueue[currentIndex]);
    return;
  }

  if (currentIndex < currentQueue.length - 1) {
    currentIndex++;
    playSong(currentQueue[currentIndex]);
  } else if (repeatMode === "all") {
    currentIndex = 0;
    playSong(currentQueue[currentIndex]);
  }
}

function playPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    playSong(currentQueue[currentIndex]);
  } else if (repeatMode === "all" && currentQueue.length > 0) {
    currentIndex = currentQueue.length - 1;
    playSong(currentQueue[currentIndex]);
  }
}

// ---------- PROGRESS BAR ----------
let progressInterval = null;
function startProgressUpdater() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (player && player.getCurrentTime && player.getDuration) {
      const cur = player.getCurrentTime();
      const dur = player.getDuration();
      document.querySelectorAll(".seek-bar").forEach((b) => { b.value = dur ? (cur / dur) * 100 : 0; });
      setAllText(".cur-time", formatTime(cur));
      setAllText(".dur-time", formatTime(dur));
    }
  }, 1000);
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// ---------- FAVORITES ----------
function toggleFavoriteById(id) {
  const song =
    currentQueue.find((s) => s.id === id) ||
    favorites.find((s) => s.id === id) ||
    recentlyPlayed.find((s) => s.id === id);
  if (!song) return;

  const existingIndex = favorites.findIndex((f) => f.id === id);
  if (existingIndex >= 0) favorites.splice(existingIndex, 1);
  else favorites.push(song);

  localStorage.setItem("surtaal_favorites", JSON.stringify(favorites));
  updateFavIcon(id);
}

function updateFavIcon(currentSongId) {
  const isFav = favorites.some((f) => f.id === currentSongId);
  setAllHTML(".fav-btn", ICONS.heart);
  toggleAllClass(".fav-btn", "is-fav", isFav);
}

function showFavorites() {
  currentContext = { type: "favorites" };
  setHomeExtrasVisible(false);
  document.getElementById("sectionTitle").textContent = "Your Favorites";
  document.getElementById("emptyHint").textContent = favorites.length ? "" : "No favorites yet — tap the heart on any song.";
  currentQueue = favorites;
  renderSongGrid(favorites);
}

// ---------- RECENTLY PLAYED ----------
function logRecentlyPlayed(song) {
  recentlyPlayed = recentlyPlayed.filter((s) => s.id !== song.id);
  recentlyPlayed.unshift(song);
  if (recentlyPlayed.length > 40) recentlyPlayed.length = 40;
  localStorage.setItem("surtaal_recent", JSON.stringify(recentlyPlayed));
}

function showRecentlyPlayed() {
  currentContext = { type: "recent" };
  setHomeExtrasVisible(false);
  document.getElementById("sectionTitle").textContent = "Recently Played";
  document.getElementById("emptyHint").textContent = recentlyPlayed.length ? "" : "Nothing played yet.";
  currentQueue = recentlyPlayed;
  renderSongGrid(recentlyPlayed);
}

// ---------- QUEUE ----------
function showQueue() {
  currentContext = { type: "queue" };
  setHomeExtrasVisible(false);
  document.getElementById("sectionTitle").textContent = "Queue";
  document.getElementById("emptyHint").textContent = currentQueue.length ? "Tap any song to play from there." : "Your queue is empty.";
  renderSongGrid(currentQueue);
}

function removeFromQueue(index) {
  currentQueue.splice(index, 1);
  if (index < currentIndex) currentIndex--;
  renderSongGrid(currentQueue);
}

// ---------- HOME + MOOD CHIPS + MADE FOR YOU ----------
function setHomeExtrasVisible(visible) {
  document.getElementById("moodChips").hidden = !visible;
  document.getElementById("madeForYouBtn").hidden = !visible;
}

function renderMoodChips() {
  document.getElementById("moodChips").innerHTML = MOODS.map(
    (m) => `<button class="chip" data-query="${m.query}">${m.label}</button>`
  ).join("");
}

document.getElementById("moodChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.getElementById("searchInput").value = chip.dataset.query;
  searchSongs();
});

function showHome() {
  currentContext = { type: "home" };
  setHomeExtrasVisible(true);
  document.getElementById("sectionTitle").textContent = "Home";
  if (recentlyPlayed.length) {
    document.getElementById("emptyHint").textContent = "Pick up where you left off, or explore a mood below.";
    currentQueue = recentlyPlayed;
    renderSongGrid(recentlyPlayed);
  } else {
    document.getElementById("emptyHint").textContent = "Tap a mood below to get started.";
    currentQueue = [];
    renderSongGrid([]);
  }
}

async function playMadeForYou() {
  if (favorites.length === 0) {
    showToast("Favorite a few songs first, then your mix will be ready");
    return;
  }
  const seed = favorites[Math.floor(Math.random() * favorites.length)];
  const seedWords = seed.title.split(/\s+/).slice(0, 3).join(" ");
  document.getElementById("searchInput").value = `${seed.channel} ${seedWords}`;
  await searchSongs();

  const shuffledFavs = [...favorites].sort(() => Math.random() - 0.5).slice(0, 6);
  currentQueue = shuffledFavs.concat(currentQueue.filter((s) => !shuffledFavs.some((f) => f.id === s.id)));
  currentContext = { type: "search" };
  document.getElementById("sectionTitle").textContent = "✨ Made For You";
  renderSongGrid(currentQueue);
}

// ---------- RADIO ----------
async function startRadio() {
  if (currentIndex < 0 || !currentQueue[currentIndex]) {
    showToast("Play a song first, then Radio can start");
    return;
  }
  const seed = currentQueue[currentIndex];
  const seedWords = seed.title.split(/\s+/).slice(0, 3).join(" ");
  const query = `${seed.channel} ${seedWords}`;

  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet&type=video&videoCategoryId=10&maxResults=12" +
    `&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) { showToast("Radio couldn't start — try again"); return; }

    const related = (data.items || [])
      .map((item) => ({
        id: item.id.videoId,
        title: decodeHTML(item.snippet.title),
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
      }))
      .filter((s) => s.id !== seed.id && !currentQueue.some((q) => q.id === s.id));

    currentQueue = currentQueue.concat(related);
    showToast(`Radio started — added ${related.length} similar songs to the queue`);
  } catch (err) {
    showToast("Check your internet — Radio didn't start");
  }
}

// ---------- LYRICS (link-out only — never shown in-app, copyright) ----------
function openLyrics() {
  if (currentIndex < 0 || !currentQueue[currentIndex]) {
    showToast("Play a song first");
    return;
  }
  const song = currentQueue[currentIndex];
  const query = encodeURIComponent(song.title + " lyrics");
  window.open(`https://genius.com/search?q=${query}`, "_blank", "noopener");
}

// ---------- PLAYLISTS ----------
async function createPlaylist() {
  const name = await showInputModal("Playlist name");
  if (!name || playlists[name]) return;
  playlists[name] = [];
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  renderPlaylistSidebar();
  showToast(`Playlist "${name}" created`);
}

function showPlaylistPicker(songId) {
  const names = Object.keys(playlists);
  if (names.length === 0) {
    showToast("Create a playlist first — tap + in the sidebar");
    return;
  }
  const list = document.getElementById("pickerList");
  list.innerHTML = names.map((n) => `<li data-name="${n}">${n}</li>`).join("");
  document.getElementById("pickerModal").hidden = false;

  function onClick(e) {
    const li = e.target.closest("li");
    if (!li) return;
    const name = li.dataset.name;
    const song =
      currentQueue.find((s) => s.id === songId) ||
      favorites.find((s) => s.id === songId) ||
      recentlyPlayed.find((s) => s.id === songId);
    if (song) {
      playlists[name].push(song);
      localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
      showToast(`Added to "${name}"`);
    }
    document.getElementById("pickerModal").hidden = true;
    list.removeEventListener("click", onClick);
  }
  list.addEventListener("click", onClick);
}

function removeFromPlaylist(playlistName, songId) {
  if (!playlists[playlistName]) return;
  playlists[playlistName] = playlists[playlistName].filter((s) => s.id !== songId);
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  if (currentContext.type === "playlist" && currentContext.name === playlistName) {
    currentQueue = playlists[playlistName];
    renderSongGrid(currentQueue);
  }
}

async function renamePlaylist(oldName) {
  const newName = await showInputModal("New name", oldName);
  if (!newName || newName === oldName || playlists[newName]) return;
  playlists[newName] = playlists[oldName];
  delete playlists[oldName];
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  renderPlaylistSidebar();
  if (currentContext.type === "playlist" && currentContext.name === oldName) {
    currentContext.name = newName;
    document.getElementById("sectionTitle").textContent = newName;
  }
}

async function deletePlaylist(name) {
  const ok = await showConfirmModal(`Delete playlist "${name}"?`);
  if (!ok) return;
  delete playlists[name];
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  renderPlaylistSidebar();
  if (currentContext.type === "playlist" && currentContext.name === name) showHome();
  showToast("Playlist deleted");
}

function renderPlaylistSidebar() {
  const list = document.getElementById("playlistList");
  list.innerHTML = "";
  Object.keys(playlists).forEach((name) => {
    const li = document.createElement("li");
    li.className = "playlist-item";
    li.innerHTML = `
      <span class="playlist-name" data-name="${name}">${ICONS.music}<span>${name}</span></span>
      <span class="playlist-tools">
        <button data-action="renamelist" data-name="${name}" title="Rename">${ICONS.edit}</button>
        <button data-action="deletelist" data-name="${name}" title="Delete">${ICONS.trash}</button>
      </span>
    `;
    list.appendChild(li);
  });
}

document.getElementById("playlistList").addEventListener("click", (e) => {
  const toolBtn = e.target.closest("button");
  if (toolBtn) {
    const name = toolBtn.dataset.name;
    if (toolBtn.dataset.action === "renamelist") renamePlaylist(name);
    else if (toolBtn.dataset.action === "deletelist") deletePlaylist(name);
    return;
  }
  const nameSpan = e.target.closest(".playlist-name");
  if (nameSpan) {
    const name = nameSpan.dataset.name;
    currentContext = { type: "playlist", name };
    setHomeExtrasVisible(false);
    const songs = playlists[name];
    document.getElementById("sectionTitle").textContent = name;
    document.getElementById("emptyHint").textContent = songs.length ? "" : "This playlist is empty.";
    currentQueue = songs;
    renderSongGrid(songs);
  }
});

// ---------- SHARE ----------
onAllClick(".share-btn", async () => {
  if (currentIndex < 0 || !currentQueue[currentIndex]) return;
  const song = currentQueue[currentIndex];
  const url = `https://youtu.be/${song.id}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: song.title, text: `${song.title} — listening on SurTaal`, url });
    } catch (e) { /* user cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch (e) {
      showToast("Here's the link: " + url);
    }
  }
});

// ---------- EVENT LISTENERS ----------
document.getElementById("searchBtn").addEventListener("click", searchSongs);
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchSongs();
});

onAllClick(".play-pause-btn", togglePlayPause);
onAllClick(".next-btn", playNext);
onAllClick(".prev-btn", playPrev);
onAllClick(".radio-btn", startRadio);
onAllClick(".lyrics-btn", openLyrics);
onAllClick(".fav-btn", () => {
  if (currentIndex >= 0 && currentQueue[currentIndex]) toggleFavoriteById(currentQueue[currentIndex].id);
});

onAllClick(".shuffle-btn", () => {
  shuffleOn = !shuffleOn;
  toggleAllClass(".shuffle-btn", "active", shuffleOn);
});

onAllClick(".repeat-btn", () => {
  if (repeatMode === "off") repeatMode = "all";
  else if (repeatMode === "all") repeatMode = "one";
  else repeatMode = "off";
  setAllHTML(".repeat-btn", repeatMode === "one" ? ICONS.repeatOne : ICONS.repeat);
  toggleAllClass(".repeat-btn", "active", repeatMode !== "off");
});

document.querySelectorAll(".seek-bar").forEach((bar) => {
  bar.addEventListener("input", (e) => {
    if (player && player.getDuration) {
      const dur = player.getDuration();
      player.seekTo((e.target.value / 100) * dur, true);
      document.querySelectorAll(".seek-bar").forEach((b) => { if (b !== e.target) b.value = e.target.value; });
    }
  });
});

document.getElementById("newPlaylistBtn").addEventListener("click", createPlaylist);
document.getElementById("homeBtn").addEventListener("click", showHome);
document.getElementById("favoritesBtn").addEventListener("click", showFavorites);
document.getElementById("recentBtn").addEventListener("click", showRecentlyPlayed);
document.getElementById("queueBtn").addEventListener("click", showQueue);
document.getElementById("madeForYouBtn").addEventListener("click", playMadeForYou);

document.getElementById("volumeBar").addEventListener("input", (e) => {
  if (player && player.setVolume) player.setVolume(e.target.value);
});

document.getElementById("modeSwitch").addEventListener("click", (e) => {
  const pill = e.target.closest(".mode-pill");
  if (!pill) return;
  searchMode = pill.dataset.modeType;
  document.querySelectorAll("#modeSwitch .mode-pill").forEach((p) => p.classList.toggle("active", p === pill));
});

document.getElementById("settingsBtn").addEventListener("click", () => openModal("settingsModal"));
document.getElementById("aboutBtn").addEventListener("click", () => openModal("aboutModal"));
document.getElementById("modeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-mode");
  applyMode(current === "light" ? "dark" : "light");
});

document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.hidden = true; });
});
document.querySelectorAll(".theme-swatch").forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// ---------- INIT ----------
renderStaticIcons();
applyTheme(localStorage.getItem("surtaal_theme") || "marigold");
applyMode(localStorage.getItem("surtaal_mode") || "dark");
renderPlaylistSidebar();
renderMoodChips();
showHome();

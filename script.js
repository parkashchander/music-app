/* =============================================================
   SurTaal — script.js (V2)
   Naye features: theme switching, shuffle/repeat, queue,
   recently played, playlist rename/delete/remove-song, share.
   Har section ke upar comment hai — beginner ho toh padhte jao.
   ============================================================= */

// 🔑 STEP: YouTube Data API v3 key yahan paste karo.
const YT_API_KEY = "AIzaSyD0cDCx2O-GkCqoqPuQFWl4wRd2Uu__eK8";

// ---------- GLOBAL STATE ----------
let player = null;
let currentQueue = [];            // songs jo abhi screen par dikh rahe hain (yehi actual play-queue bhi hai)
let currentIndex = -1;            // currentQueue mein se kaunsa gaana play ho raha hai
let currentContext = { type: "search" }; // batata hai screen par KYA dikh raha hai (search/favorites/recent/queue/playlist)
let shuffleOn = false;
let repeatMode = "off";           // "off" | "all" | "one"

let playlists = JSON.parse(localStorage.getItem("surtaal_playlists")) || {};
let favorites = JSON.parse(localStorage.getItem("surtaal_favorites")) || [];
let recentlyPlayed = JSON.parse(localStorage.getItem("surtaal_recent")) || [];

// ---------- THEME ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("surtaal_theme", theme);
}
applyTheme(localStorage.getItem("surtaal_theme") || "marigold");

// ---------- MODALS (About / Settings) ----------
function openModal(id) { document.getElementById(id).hidden = false; }
function closeModal(id) { document.getElementById(id).hidden = true; }

// ---------- YOUTUBE PLAYER READY ----------
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    playerVars: { playsinline: 1 },
    events: {
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerStateChange(event) {
  const playBtn = document.getElementById("playPauseBtn");
  const thumb = document.getElementById("npThumb");
  if (event.data === YT.PlayerState.PLAYING) {
    playBtn.textContent = "⏸";
    thumb.classList.add("is-playing");
    startProgressUpdater();
  } else {
    playBtn.textContent = "▶";
    thumb.classList.remove("is-playing");
  }
  if (event.data === YT.PlayerState.ENDED) {
    playNext();
  }
}

function onPlayerError() {
  document.getElementById("npTitle").textContent =
    "⚠️ Yeh gaana embed nahi ho sakta — agla try ho raha hai...";
  setTimeout(playNext, 800);
}

// ---------- SEARCH ----------
async function searchSongs() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  currentContext = { type: "search" };
  document.getElementById("sectionTitle").textContent = `"${query}" ke results`;
  document.getElementById("emptyHint").textContent = "Kisi bhi song par click karke play karo.";

  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet&type=video&videoCategoryId=10&maxResults=16" +
    `&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      alert("API error: " + data.error.message + "\n(GUIDE.md ka Step 3 dobara check karo)");
      return;
    }

    currentQueue = data.items.map((item) => ({
      id: item.id.videoId,
      title: decodeHTML(item.snippet.title),
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    renderSongGrid(currentQueue);
  } catch (err) {
    console.error(err);
    alert("Kuch galat ho gaya — apna internet connection check karo.");
  }
}

function decodeHTML(text) {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// ---------- RENDER SONG GRID (context ke hisaab se buttons badalte hain) ----------
function renderSongGrid(songs) {
  const container = document.getElementById("resultsContainer");
  container.innerHTML = "";

  if (songs.length === 0) {
    container.innerHTML = `<p class="empty-hint">Yahan abhi kuch nahi hai.</p>`;
    return;
  }

  songs.forEach((song, index) => {
    const isFav = favorites.some((f) => f.id === song.id);

    let extraButton = `<button data-action="addlist" data-id="${song.id}">+ List</button>`;
    if (currentContext.type === "playlist") {
      extraButton = `<button data-action="removefromplaylist" data-id="${song.id}">✕ Remove</button>`;
    } else if (currentContext.type === "queue") {
      extraButton = `<button data-action="removefromqueue" data-index="${index}">✕ Remove</button>`;
    }

    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="${song.thumbnail}" alt="${song.title}">
      <div class="song-title">${song.title}</div>
      <div class="song-channel">${song.channel}</div>
      <div class="card-actions">
        <button data-action="play" data-index="${index}">▶ Play</button>
        <button data-action="fav" data-id="${song.id}" class="${isFav ? "is-fav" : ""}">${isFav ? "❤" : "♡"}</button>
        ${extraButton}
      </div>
    `;
    container.appendChild(card);
  });
}

// Ek hi baar re-render karne ke liye — jo bhi abhi screen par dikh raha hai (currentQueue) usko dobara draw karo
function refreshCurrentView() {
  renderSongGrid(currentQueue);
}

// Event delegation — grid ke andar kisi bhi button ka click yahin se handle hota hai
document.getElementById("resultsContainer").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "play") {
    playFromQueue(Number(btn.dataset.index));
  } else if (action === "fav") {
    toggleFavoriteById(btn.dataset.id);
    refreshCurrentView();
  } else if (action === "addlist") {
    openPlaylistPicker(btn.dataset.id);
  } else if (action === "removefromplaylist") {
    removeFromPlaylist(currentContext.name, btn.dataset.id);
  } else if (action === "removefromqueue") {
    removeFromQueue(Number(btn.dataset.index));
  }
});

// ---------- PLAYBACK ----------
function playFromQueue(index) {
  currentIndex = index;
  playSong(currentQueue[index]);
}

function playSong(song) {
  if (!player || !player.loadVideoById) {
    alert("Player abhi load ho raha hai, 2 second baad dobara try karo.");
    return;
  }
  player.loadVideoById(song.id);
  player.playVideo();

  document.getElementById("npTitle").textContent = song.title;
  document.getElementById("npChannel").textContent = song.channel;
  const thumb = document.getElementById("npThumb");
  thumb.src = song.thumbnail;
  thumb.hidden = false;

  // Naya gaana load hote waqt purana progress dikhna band karo
  document.getElementById("seekBar").value = 0;
  document.getElementById("curTime").textContent = "0:00";
  document.getElementById("durTime").textContent = "0:00";

  updateFavIcon(song.id);
  logRecentlyPlayed(song);
}

function togglePlayPause() {
  if (!player || !player.getPlayerState) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function playNext() {
  if (currentQueue.length === 0) return;

  if (repeatMode === "one") {
    playSong(currentQueue[currentIndex]);
    return;
  }

  if (shuffleOn && currentQueue.length > 1) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    } while (nextIndex === currentIndex);
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

// ---------- SHUFFLE & REPEAT TOGGLES ----------
document.getElementById("shuffleBtn").addEventListener("click", () => {
  shuffleOn = !shuffleOn;
  document.getElementById("shuffleBtn").classList.toggle("active", shuffleOn);
});

document.getElementById("repeatBtn").addEventListener("click", () => {
  const btn = document.getElementById("repeatBtn");
  if (repeatMode === "off") repeatMode = "all";
  else if (repeatMode === "all") repeatMode = "one";
  else repeatMode = "off";

  btn.textContent = repeatMode === "one" ? "🔂" : repeatMode === "all" ? "🔁" : "➡";
  btn.classList.toggle("active", repeatMode !== "off");
});

// ---------- PROGRESS BAR ----------
let progressInterval = null;

function startProgressUpdater() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (player && player.getCurrentTime && player.getDuration) {
      const cur = player.getCurrentTime();
      const dur = player.getDuration();
      document.getElementById("seekBar").value = dur ? (cur / dur) * 100 : 0;
      document.getElementById("curTime").textContent = formatTime(cur);
      document.getElementById("durTime").textContent = formatTime(dur);
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
    currentQueue.find((s) => s.id === id) || favorites.find((s) => s.id === id);
  if (!song) return;

  const existingIndex = favorites.findIndex((f) => f.id === id);
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push(song);
  }
  localStorage.setItem("surtaal_favorites", JSON.stringify(favorites));
  updateFavIcon(id);
}

function updateFavIcon(currentSongId) {
  const isFav = favorites.some((f) => f.id === currentSongId);
  document.getElementById("npFav").textContent = isFav ? "❤" : "♡";
}

function showFavorites() {
  currentContext = { type: "favorites" };
  document.getElementById("sectionTitle").textContent = "Your Favorites";
  document.getElementById("emptyHint").textContent = favorites.length
    ? ""
    : "Abhi tak koi favorite nahi hai — kisi gaane par ♡ dabao.";
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
  document.getElementById("sectionTitle").textContent = "Recently Played";
  document.getElementById("emptyHint").textContent = recentlyPlayed.length
    ? ""
    : "Abhi tak kuch play nahi kiya.";
  currentQueue = recentlyPlayed;
  renderSongGrid(recentlyPlayed);
}

// ---------- QUEUE ----------
function showQueue() {
  currentContext = { type: "queue" };
  document.getElementById("sectionTitle").textContent = "Queue — Ab Tak Ki List";
  document.getElementById("emptyHint").textContent = currentQueue.length
    ? "Kisi bhi gaane par click karke seedha wahan se play karo."
    : "Queue khaali hai — pehle kuch search ya play karo.";
  renderSongGrid(currentQueue);
}

function removeFromQueue(index) {
  currentQueue.splice(index, 1);
  if (index < currentIndex) {
    currentIndex--;
  }
  renderSongGrid(currentQueue);
}

// ---------- PLAYLISTS ----------
function createPlaylist() {
  const name = prompt("Playlist ka naam likho:");
  if (!name || playlists[name]) return;
  playlists[name] = [];
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  renderPlaylistSidebar();
}

function openPlaylistPicker(songId) {
  const names = Object.keys(playlists);
  if (names.length === 0) {
    alert("Pehle ek playlist banao — sidebar mein '+' button dabao.");
    return;
  }
  const choice = prompt("Kis playlist mein daalna hai?\n" + names.join(", "));
  if (choice && playlists[choice]) {
    const song =
      currentQueue.find((s) => s.id === songId) || favorites.find((s) => s.id === songId);
    if (song) {
      playlists[choice].push(song);
      localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
    }
  }
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

function renamePlaylist(oldName) {
  const newName = prompt("Naya naam:", oldName);
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

function deletePlaylist(name) {
  if (!confirm(`"${name}" playlist delete karni hai?`)) return;
  delete playlists[name];
  localStorage.setItem("surtaal_playlists", JSON.stringify(playlists));
  renderPlaylistSidebar();
  if (currentContext.type === "playlist" && currentContext.name === name) {
    currentContext = { type: "search" };
    currentQueue = [];
    renderSongGrid([]);
    document.getElementById("sectionTitle").textContent = "Koi gaana search karo shuru karne ke liye";
  }
}

function renderPlaylistSidebar() {
  const list = document.getElementById("playlistList");
  list.innerHTML = "";
  Object.keys(playlists).forEach((name) => {
    const li = document.createElement("li");
    li.className = "playlist-item";
    li.innerHTML = `
      <span class="playlist-name" data-name="${name}">🎵 ${name}</span>
      <span class="playlist-tools">
        <button data-action="renamelist" data-name="${name}" title="Rename">✎</button>
        <button data-action="deletelist" data-name="${name}" title="Delete">🗑</button>
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
    const songs = playlists[name];
    document.getElementById("sectionTitle").textContent = name;
    document.getElementById("emptyHint").textContent = songs.length ? "" : "Yeh playlist abhi khaali hai.";
    currentQueue = songs;
    renderSongGrid(songs);
  }
});

// ---------- SHARE ----------
document.getElementById("npShare").addEventListener("click", async () => {
  if (currentIndex < 0 || !currentQueue[currentIndex]) return;
  const song = currentQueue[currentIndex];
  const url = `https://youtu.be/${song.id}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: song.title, text: `${song.title} — SurTaal par sun raha hun`, url });
    } catch (e) {
      // user ne share cancel kar diya — kuch karne ki zaroorat nahi
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copy ho gaya: " + url);
    } catch (e) {
      alert("Yeh raha link: " + url);
    }
  }
});

// ---------- SAB EVENT LISTENERS ----------
document.getElementById("searchBtn").addEventListener("click", searchSongs);
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchSongs();
});
document.getElementById("playPauseBtn").addEventListener("click", togglePlayPause);
document.getElementById("nextBtn").addEventListener("click", playNext);
document.getElementById("prevBtn").addEventListener("click", playPrev);
document.getElementById("newPlaylistBtn").addEventListener("click", createPlaylist);
document.getElementById("favoritesBtn").addEventListener("click", showFavorites);
document.getElementById("recentBtn").addEventListener("click", showRecentlyPlayed);
document.getElementById("queueBtn").addEventListener("click", showQueue);

document.getElementById("npFav").addEventListener("click", () => {
  if (currentIndex >= 0 && currentQueue[currentIndex]) {
    toggleFavoriteById(currentQueue[currentIndex].id);
  }
});

document.getElementById("seekBar").addEventListener("input", (e) => {
  if (player && player.getDuration) {
    const dur = player.getDuration();
    player.seekTo((e.target.value / 100) * dur, true);
  }
});

document.getElementById("volumeBar").addEventListener("input", (e) => {
  if (player && player.setVolume) player.setVolume(e.target.value);
});

// Settings / About modal open buttons
document.getElementById("settingsBtn").addEventListener("click", () => openModal("settingsModal"));
document.getElementById("aboutBtn").addEventListener("click", () => openModal("aboutModal"));

// Modal close (✕ button ya bahar click karne par)
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.hidden = true;
  });
});

// Theme swatches
document.querySelectorAll(".theme-swatch").forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// ---------- PAGE LOAD HOTE HI SAVED PLAYLISTS DIKHAO ----------
renderPlaylistSidebar();
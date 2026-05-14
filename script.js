const image = document.getElementById("image");
const map = document.getElementById("map");
const dotsLayer = document.getElementById("dots-layer");

const box = document.getElementById("box");
const noteInput = document.getElementById("noteInput");

const saveBtn = document.getElementById("saveBtn");
const closeBtn = document.getElementById("closeBtn");

const overlay = document.getElementById("overlay");

const previewCard = document.getElementById("previewCard");

let activeDotId = null;

/* ================= CAMERA ================= */
let camera = { x: 0, y: 0, scale: 1 };

function applyCamera() {
  map.style.transform =
    `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}

/* ================= DATA ================= */
let dots = [];

function dotsJsonUrl() {
  for (let i = 0; i < document.scripts.length; i++) {
    const s = document.scripts[i];
    if (!s.src || !/\/script\.js(\?.*)?$/i.test(s.src)) continue;
    return new URL("dots.json", s.src).href;
  }
  const { origin, pathname } = window.location;
  let dir = pathname;
  if (!dir.endsWith("/")) {
    const last = dir.lastIndexOf("/");
    const seg = dir.slice(last + 1);
    dir = seg.includes(".") ? dir.slice(0, last + 1) : dir + "/";
  }
  return origin + dir + "dots.json";
}

async function loadDots() {
  try {
    const res = await fetch(dotsJsonUrl(), { cache: "no-cache" });
    if (!res.ok) throw new Error("dots.json yüklenemedi");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    dots = list.map((d) => ({
      ...d,
      id: Number(d.id),
      x: Number(d.x),
      y: Number(d.y),
      text: String(d.text ?? ""),
      note: String(d.note ?? "")
    }));
  } catch {
    dots = [];
  }
  renderAllDots();
}

loadDots();

/* ================= ADD DOT ================= */
image.addEventListener("click", (e) => {
  if (e.target !== image) return;

  const rect = image.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const text = prompt("Nokta adı:");
  if (!text) return;

  dots.push({
    id: Date.now(),
    x,
    y,
    text,
    note: ""
  });

  renderAllDots();
});

/* ================= RENDER ================= */
function renderAllDots() {
  dotsLayer.innerHTML = "";

  const rect = image.getBoundingClientRect();

  dots.forEach(dot => {
    const el = document.createElement("div");
    el.className = "dot";
    el.dataset.id = dot.id;
    el.innerText = "📍";

    el.style.left = (dot.x * rect.width) + "px";
    el.style.top = (dot.y * rect.height) + "px";

    /* ================= CLICK ================= */
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(dot);
    });

    /* ================= RIGHT CLICK DELETE ================= */
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();

      dots = dots.filter((d) => d.id !== dot.id);
      renderAllDots();
    });

    /* ================= HOVER PREVIEW (FIXED) ================= */
    el.addEventListener("mouseenter", () => {
      previewCard.style.display = "block";

      const fresh = dots.find(d => d.id === Number(el.dataset.id));

      const firstLine = (fresh.note || "").split("\n")[0].trim();

      previewCard.innerHTML = `
        <b>${fresh.text}</b>
        <div style="opacity:.7;margin-top:4px">
          ${firstLine ? firstLine.slice(0, 40) : "Not yok"}
        </div>
      `;
    });

    el.addEventListener("mousemove", (e) => {
      previewCard.style.left = e.clientX + 15 + "px";
      previewCard.style.top = e.clientY + 15 + "px";
    });

    el.addEventListener("mouseleave", () => {
      previewCard.style.display = "none";
    });

    dotsLayer.appendChild(el);
  });
}

/* ================= POPUP ================= */
function showPopup(dot) {
  activeDotId = dot.id;

  box.style.display = "block";
  overlay.style.display = "block";

  setTimeout(() => box.classList.add("show"), 10);

  noteInput.value = dot.note || "";
}

/* ================= SAVE NOTE ================= */
saveBtn.onclick = () => {
  const dot = dots.find(d => d.id === activeDotId);
  if (!dot) return;

  dot.note = noteInput.value;

  renderAllDots();
};

/* ================= CLOSE ================= */
function closeBox() {
  box.classList.remove("show");

  setTimeout(() => {
    box.style.display = "none";
    overlay.style.display = "none";
  }, 200);
}

closeBtn.onclick = closeBox;
overlay.addEventListener("click", closeBox);

/* ================= ZOOM ================= */
function focusDot(dot) {
  const rect = image.getBoundingClientRect();

  const x = dot.x * rect.width;
  const y = dot.y * rect.height;

  camera.scale = 2.5;

  camera.x = (rect.width / 2) - x * camera.scale;
  camera.y = (rect.height / 2) - y * camera.scale;

  applyCamera();
}

/* ================= RESET ================= */
function resetView() {
  camera = { x: 0, y: 0, scale: 1 };
  applyCamera();
}

/* ================= RESIZE ================= */
window.addEventListener("resize", renderAllDots);

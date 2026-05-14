import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= DOM ================= */
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

/* ================= LOAD FROM FIREBASE ================= */
async function loadDots() {
  const snap = await getDocs(collection(db, "dots"));
  dots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderAllDots();
}

loadDots();

/* ================= ADD DOT ================= */
image.addEventListener("click", async (e) => {
  if (e.target !== image) return;

  const rect = image.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const text = prompt("Nokta adı:");
  if (!text) return;

  await addDoc(collection(db, "dots"), {
    x,
    y,
    text,
    note: ""
  });

  loadDots();
});

/* ================= RENDER ================= */
function renderAllDots() {
  dotsLayer.innerHTML = "";

  const rect = image.getBoundingClientRect();

  dots.forEach(dot => {
    const el = document.createElement("div");
    el.className = "dot";
    el.innerText = "📍";

    el.style.left = (dot.x * rect.width) + "px";
    el.style.top = (dot.y * rect.height) + "px";

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(dot);
    });

    el.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      await deleteDoc(doc(db, "dots", dot.id));
      loadDots();
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
saveBtn.onclick = async () => {
  const ref = doc(db, "dots", activeDotId);

  await updateDoc(ref, {
    note: noteInput.value
  });

  loadDots();
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

/* ================= RESIZE ================= */
window.addEventListener("resize", renderAllDots);

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

/* FIREBASE */
const db = window.db;
const { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } = window.fb;

let dots = [];

/* ================= LOAD ================= */
async function loadDots() {
  const snap = await getDocs(collection(db, "dots"));

  dots = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

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

    /* OPEN */
    el.onclick = () => showPopup(dot);

    /* DELETE */
    el.oncontextmenu = async (e) => {
      e.preventDefault();
      await deleteDoc(doc(db, "dots", dot.id));
      loadDots();
    };

    /* HOVER */
    el.onmouseenter = () => {
      previewCard.style.display = "block";
      previewCard.innerHTML = `
        <b>${dot.text}</b>
        <div>${dot.note || "Not yok"}</div>
      `;
    };

    el.onmousemove = (e) => {
      previewCard.style.left = e.clientX + 10 + "px";
      previewCard.style.top = e.clientY + 10 + "px";
    };

    el.onmouseleave = () => {
      previewCard.style.display = "none";
    };

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
  await updateDoc(doc(db, "dots", activeDotId), {
    note: noteInput.value
  });

  closeBox();
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
overlay.onclick = closeBox;

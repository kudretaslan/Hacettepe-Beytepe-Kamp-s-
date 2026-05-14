const image = document.getElementById("image");
const dotsLayer = document.getElementById("dots-layer");

const box = document.getElementById("box");
const note = document.getElementById("note");
const saveBtn = document.getElementById("save");
const closeBtn = document.getElementById("close");
const preview = document.getElementById("preview");

let activeId = null;

const col = () => window.fb.collection(window.db, "dots");

let dots = [];

/* ================= LOAD ================= */
async function load() {
  const snap = await window.fb.getDocs(col());
  dots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
}

load();

/* ================= ADD ================= */
image.addEventListener("click", async (e) => {
  if (e.target !== image) return;

  const r = image.getBoundingClientRect();

  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;

  const text = prompt("Nokta adı:");
  if (!text) return;

  await window.fb.addDoc(col(), {
    x, y, text, note: ""
  });

  load();
});

/* ================= RENDER ================= */
function render() {
  dotsLayer.innerHTML = "";

  const r = image.getBoundingClientRect();

  dots.forEach(d => {
    const el = document.createElement("div");
    el.className = "dot";
    el.innerText = "📍";

    el.style.left = (d.x * r.width) + "px";
    el.style.top = (d.y * r.height) + "px";

    el.onclick = () => {
      activeId = d.id;
      box.style.display = "block";
      note.value = d.note || "";
    };

    el.oncontextmenu = async (e) => {
      e.preventDefault();
      await window.fb.deleteDoc(window.fb.doc(window.db, "dots", d.id));
      load();
    };

    el.onmouseenter = () => {
      preview.style.display = "block";
      preview.innerHTML = `<b>${d.text}</b><br>${d.note || "Not yok"}`;
    };

    el.onmousemove = (e) => {
      preview.style.left = e.pageX + 10 + "px";
      preview.style.top = e.pageY + 10 + "px";
    };

    el.onmouseleave = () => preview.style.display = "none";

    dotsLayer.appendChild(el);
  });
}

/* ================= SAVE NOTE ================= */
saveBtn.onclick = async () => {
  await window.fb.updateDoc(
    window.fb.doc(window.db, "dots", activeId),
    { note: note.value }
  );

  box.style.display = "none";
  load();
};

/* ================= CLOSE ================= */
closeBtn.onclick = () => {
  box.style.display = "none";
};

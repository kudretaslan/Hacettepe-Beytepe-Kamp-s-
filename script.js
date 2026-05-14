window.addEventListener("load", () => {

const image = document.getElementById("image");
const dotsLayer = document.getElementById("dots-layer");
const box = document.getElementById("box");
const note = document.getElementById("note");
const saveBtn = document.getElementById("save");
const closeBtn = document.getElementById("close");
const preview = document.getElementById("preview");

let dots = [];
let active = null;

/* ================= LOAD (LOCAL MODE) ================= */
function load() {
  const data = localStorage.getItem("dots");
  dots = data ? JSON.parse(data) : [];
  render();
}
load();

/* ================= SAVE ================= */
function save() {
  localStorage.setItem("dots", JSON.stringify(dots));
}

/* ================= ADD DOT ================= */
image.addEventListener("click", (e) => {

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

  save();
  render();
});

/* ================= RENDER ================= */
function render() {
  dotsLayer.innerHTML = "";

  const rect = image.getBoundingClientRect();

  dots.forEach(d => {

    const el = document.createElement("div");
    el.className = "dot";
    el.innerText = "📍";

    el.style.left = d.x * rect.width + "px";
    el.style.top = d.y * rect.height + "px";

    /* OPEN */
    el.onclick = () => {
      active = d.id;
      box.style.display = "block";
      note.value = d.note || "";
    };

    /* DELETE */
    el.oncontextmenu = (e) => {
      e.preventDefault();
      dots = dots.filter(x => x.id !== d.id);
      save();
      render();
    };

    /* PREVIEW */
    el.onmouseenter = () => {
      preview.style.display = "block";
      preview.innerHTML = `<b>${d.text}</b><br>${d.note || "not yok"}`;
    };

    el.onmousemove = (e) => {
      preview.style.left = e.pageX + 10 + "px";
      preview.style.top = e.pageY + 10 + "px";
    };

    el.onmouseleave = () => {
      preview.style.display = "none";
    };

    dotsLayer.appendChild(el);
  });
}

/* ================= SAVE NOTE ================= */
saveBtn.onclick = () => {
  const d = dots.find(x => x.id === active);
  if (!d) return;

  d.note = note.value;
  save();
  render();
  box.style.display = "none";
};

/* ================= CLOSE ================= */
closeBtn.onclick = () => {
  box.style.display = "none";
};

});

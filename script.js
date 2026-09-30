/* Sunrise Care Hospital - plain JavaScript, no libraries */
const departments = [
  { id: "cardiology", name: "Cardiology", text: "Heart tests, angiography and rhythm care." },
  { id: "neurology", name: "Neurology", text: "Stroke, epilepsy, migraine and nerve disorders." },
  { id: "orthopedics", name: "Orthopedics", text: "Bones, joints, sports injuries and replacements." },
  { id: "pediatrics", name: "Pediatrics", text: "Newborn to teenage care and vaccination." },
  { id: "gynecology", name: "Gynecology", text: "Women's health, pregnancy and delivery." },
  { id: "dermatology", name: "Dermatology", text: "Skin, hair and allergy treatment." },
  { id: "general", name: "General Medicine", text: "Fever, diabetes, blood pressure and check-ups." },
  { id: "emergency", name: "Emergency", text: "Round-the-clock trauma and critical care." }
];

const doctors = [
  { name: "Dr. Anita Deshmukh", dept: "cardiology", degree: "MD, DM (Cardiology)", exp: 18, days: "Mon, Wed, Fri", time: "10 am – 2 pm" },
  { name: "Dr. Rohan Kulkarni", dept: "cardiology", degree: "MD, DNB (Cardiology)", exp: 11, days: "Tue, Thu, Sat", time: "4 pm – 8 pm" },
  { name: "Dr. Meera Iyer", dept: "neurology", degree: "MD, DM (Neurology)", exp: 15, days: "Mon to Thu", time: "11 am – 3 pm" },
  { name: "Dr. Sameer Joshi", dept: "orthopedics", degree: "MS (Orthopedics)", exp: 20, days: "Mon, Tue, Fri", time: "9 am – 1 pm" },
  { name: "Dr. Kavita Rao", dept: "pediatrics", degree: "MD (Pediatrics)", exp: 12, days: "Mon to Sat", time: "9 am – 12 pm" },
  { name: "Dr. Farah Sheikh", dept: "gynecology", degree: "MS (OBG)", exp: 14, days: "Tue, Thu, Sat", time: "10 am – 2 pm" },
  { name: "Dr. Vikram Patil", dept: "dermatology", degree: "MD (Dermatology)", exp: 9, days: "Wed, Fri, Sat", time: "5 pm – 8 pm" },
  { name: "Dr. Neha Bhosale", dept: "general", degree: "MD (Medicine)", exp: 10, days: "Mon to Sat", time: "8 am – 4 pm" },
  { name: "Dr. Arjun Menon", dept: "emergency", degree: "MD (Emergency Medicine)", exp: 13, days: "Every day", time: "24 hours (rotation)" }
];

const $ = (s, el = document) => el.querySelector(s);
const deptName = id => departments.find(d => d.id === id).name;
const initials = n => n.replace("Dr. ", "").split(" ").map(w => w[0]).join("");
const slug = id => id; // keeps code readable

/* ---------- mobile menu ---------- */
const menuBtn = $("#menuBtn"), nav = $("#nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
});

/* ---------- open / closed status ---------- */
(function () {
  const h = new Date().getHours(), el = $("#openStatus");
  const open = h >= 8 && h < 20;
  el.textContent = open ? "OPD is open now" : "OPD is closed. Emergency is open.";
  el.classList.add(open ? "open" : "closed");
})();

/* ---------- departments ---------- */
$("#deptGrid").innerHTML = departments.map(d =>
  `<button class="dept" data-dept="${d.id}"><h3>${d.name}</h3><p>${d.text}</p></button>`).join("");
$("#deptGrid").addEventListener("click", e => {
  const b = e.target.closest(".dept");
  if (!b) return;
  setFilter(b.dataset.dept);
  $("#doctors").scrollIntoView();
});

/* ---------- doctors ---------- */
let current = "all";
function renderFilters() {
  const all = [{ id: "all", name: "All" }, ...departments];
  $("#filters").innerHTML = all.map(d =>
    `<button class="chip" data-f="${d.id}" aria-pressed="${d.id === current}">${d.name}</button>`).join("");
}
function renderDoctors() {
  const list = doctors.filter(d => current === "all" || d.dept === current);
  $("#doctorGrid").innerHTML = list.length ? list.map(d => `
    <article>
      <div class="avatar" aria-hidden="true">${initials(d.name)}</div>
      <h3>${d.name}</h3>
      <p class="role">${deptName(d.dept)}</p>
      <p class="meta">${d.degree}</p>
      <p class="meta">${d.exp} years experience</p>
      <p class="meta">${d.days}, ${d.time}</p>
      <a class="btn small ghost" href="#appointment" data-book="${d.name}">Book with ${d.name.split(" ")[1]}</a>
    </article>`).join("") : "<p>No doctors listed for this department yet.</p>";
}
function setFilter(id) { current = id; renderFilters(); renderDoctors(); }
$("#filters").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (b) setFilter(b.dataset.f);
});
$("#doctorGrid").addEventListener("click", e => {
  const a = e.target.closest("[data-book]");
  if (!a) return;
  const doc = doctors.find(d => d.name === a.dataset.book);
  deptSelect.value = doc.dept;
  fillDoctors();
  doctorSelect.value = doc.name;
});
setFilter("all");

/* ---------- appointment form ---------- */
const deptSelect = $("#deptSelect"), doctorSelect = $("#doctorSelect"), dateInput = $("#dateInput");
deptSelect.innerHTML = `<option value="">Select department</option>` +
  departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
function fillDoctors() {
  const list = doctors.filter(d => d.dept === deptSelect.value);
  doctorSelect.innerHTML = deptSelect.value
    ? `<option value="">Select doctor</option>` + list.map(d => `<option>${d.name}</option>`).join("")
    : `<option value="">Select department first</option>`;
}
deptSelect.addEventListener("change", fillDoctors);
fillDoctors();
dateInput.min = new Date().toISOString().split("T")[0];

function showError(form, field, msg) {
  const input = form.elements[field];
  $(`.err[data-for="${field}"]`, form).textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
function validate(form, rules) {
  let ok = true, first = null;
  for (const [field, check] of Object.entries(rules)) {
    const msg = check(form.elements[field].value.trim());
    if (!showError(form, field, msg)) { ok = false; first = first || form.elements[field]; }
  }
  if (first) first.focus();
  return ok;
}
const required = label => v => v ? "" : `Enter ${label}.`;

$("#apptForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  const ok = validate(f, {
    name: required("your full name"),
    phone: v => /^[+\d][\d\s-]{8,14}$/.test(v) ? "" : "Enter a valid phone number.",
    dept: v => v ? "" : "Select a department.",
    doctor: v => v ? "" : "Select a doctor.",
    date: v => !v ? "Select a date." : v < dateInput.min ? "Choose today or a later date." : "",
    time: v => v ? "" : "Select a time."
  });
  if (!ok) return;
  const msg = $("#apptOk");
  msg.textContent = `Thank you, ${f.name.value.trim()}. Your request for ${f.doctor.value} on ${f.date.value} at ${f.time.value} is received. We will call ${f.phone.value.trim()} to confirm.`;
  msg.hidden = false;
  f.reset(); fillDoctors();
});

/* ---------- contact form ---------- */
$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  const ok = validate(f, {
    cname: required("your name"),
    cemail: v => /^\S+@\S+\.\S+$/.test(v) ? "" : "Enter a valid email address.",
    cmsg: required("a message")
  });
  if (!ok) return;
  const msg = $("#contactOk");
  msg.textContent = "Message sent. Our team will reply within one working day.";
  msg.hidden = false;
  f.reset();
});

$("#year").textContent = new Date().getFullYear();

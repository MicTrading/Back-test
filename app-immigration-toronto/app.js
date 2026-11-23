(function () {
  "use strict";

  const KEY = "toronto-pret-v1";
  let currentView = "dashboard";
  let resFilter = "tous";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }
  function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }
  function todayISO() {
    return isoDate(new Date());
  }
  function addDays(d, n) {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  }
  function daysUntil(iso) {
    if (!iso) return null;
    const parts = iso.split("-").map(Number);
    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - today) / 86400000);
  }
  const dateFmt = new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric" });
  function formatDate(iso) {
    if (!iso) return "—";
    const parts = iso.split("-").map(Number);
    return dateFmt.format(new Date(parts[0], parts[1] - 1, parts[2]));
  }
  const cadFmt = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
  function money(n) {
    return cadFmt.format(Number(n) || 0);
  }

  function buildSeed() {
    const s = JSON.parse(JSON.stringify(SEED));
    const today = new Date();
    s.events = s.events.map((ev) => {
      const copy = Object.assign({}, ev);
      copy.date = ev.offsetDays != null ? isoDate(addDays(today, ev.offsetDays)) : null;
      delete copy.offsetDays;
      return copy;
    });
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.tasks) && Array.isArray(s.documents) && Array.isArray(s.events) && Array.isArray(s.budget)) return s;
      }
    } catch (e) {}
    return buildSeed();
  }

  let state = load();

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function phaseStats() {
    return state.phases.map((p) => {
      const list = state.tasks.filter((t) => t.phase === p.id);
      const done = list.filter((t) => t.done).length;
      return Object.assign({}, p, { total: list.length, done: done });
    });
  }
  function overallProgress() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  function upcomingEvents(n) {
    return state.events
      .filter((e) => e.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, n);
  }
  function expiringDocs(withinDays) {
    return state.documents
      .filter((d) => d.expiry && daysUntil(d.expiry) !== null && daysUntil(d.expiry) <= withinDays)
      .sort((a, b) => a.expiry.localeCompare(b.expiry));
  }
  function budgetTotals() {
    const planned = state.budget.reduce((s, b) => s + (Number(b.planned) || 0), 0);
    const spent = state.budget.reduce((s, b) => s + (Number(b.spent) || 0), 0);
    return { planned: planned, spent: spent, remaining: planned - spent };
  }
  function pathwayLabel(id) {
    const p = PATHWAYS.find((x) => x.id === id);
    return p ? p.label : "";
  }

  function eventBadge(iso) {
    const d = daysUntil(iso);
    if (d === null) return '<span class="badge">date à définir</span>';
    if (d < 0) return '<span class="badge danger">en retard de ' + (-d) + " j</span>";
    if (d === 0) return '<span class="badge warn">aujourd\'hui</span>';
    if (d <= 14) return '<span class="badge warn">dans ' + d + " j</span>";
    return '<span class="badge">' + esc(formatDate(iso)) + "</span>";
  }

  function statCard(label, value, sub) {
    return '<div class="card stat"><span class="stat-label">' + esc(label) + '</span><span class="stat-value">' + value + '</span><span class="stat-sub">' + esc(sub) + "</span></div>";
  }

  function renderDashboard() {
    const prog = overallProgress();
    const dep = state.settings.departureDate;
    let depTxt = "Renseignez votre date de départ dans les Paramètres pour un compte à rebours.";
    if (dep) {
      const d = daysUntil(dep);
      if (d > 0) depTxt = "Départ prévu le " + formatDate(dep) + " — dans " + d + " jour" + (d > 1 ? "s" : "") + ".";
      else if (d === 0) depTxt = "C'est le grand jour : départ aujourd'hui !";
      else depTxt = "Départ le " + formatDate(dep) + " — il y a " + (-d) + " jour" + (-d > 1 ? "s" : "") + ".";
    }
    const pl = pathwayLabel(state.settings.pathway);
    $("#dash-greeting").innerHTML =
      "<h2>Bonjour 👋</h2><p>" + esc(depTxt) + "</p>" +
      (pl ? '<p class="hint">Voie envisagée : <strong>' + esc(pl) + "</strong></p>" : "");

    const next = upcomingEvents(1)[0];
    const expiring = expiringDocs(60);
    const bt = budgetTotals();
    $("#dash-stats").innerHTML =
      statCard("Progression globale", prog.pct + " %", prog.done + "/" + prog.total + " tâches faites") +
      statCard("Prochaine échéance", next ? esc(next.title) : "—", next ? formatDate(next.date) : "aucune date définie") +
      statCard("Documents à surveiller", String(expiring.length), "expirent dans moins de 60 jours") +
      statCard("Budget restant", money(bt.remaining), money(bt.spent) + " dépensés sur " + money(bt.planned) + " prévus");

    $("#dash-phases").innerHTML = phaseStats().map((p) => {
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return '<div class="phase-row"><div class="phase-row-head"><span>' + p.icon + " " + esc(p.name) + '</span><span class="muted">' + p.done + "/" + p.total + "</span></div>" +
        '<div class="progress"><div style="width:' + pct + '%"></div></div></div>';
    }).join("");

    const events = upcomingEvents(5);
    $("#dash-events").innerHTML = events.length
      ? events.map((ev) => '<div class="kv"><span>' + esc(ev.title) + "</span>" + eventBadge(ev.date) + "</div>").join("")
      : '<p class="hint">Aucune échéance avec date. Ajoutez-en une dans le Calendrier.</p>';

    $("#dash-docs").innerHTML = expiring.length
      ? expiring.map((d) => {
          const dd = daysUntil(d.expiry);
          return '<div class="kv"><span>' + esc(d.name) + '</span><span class="badge ' + (dd < 0 ? "danger" : "warn") + '">' + (dd < 0 ? "expiré le " + formatDate(d.expiry) : "expire le " + formatDate(d.expiry)) + "</span></div>";
        }).join("")
      : '<p class="hint">Aucun document n\'expire dans les 60 prochains jours.</p>';

    const pct = bt.planned ? Math.min(100, Math.round((bt.spent / bt.planned) * 100)) : 0;
    $("#dash-budget").innerHTML =
      '<div class="kv"><span>Prévu</span><strong>' + money(bt.planned) + "</strong></div>" +
      '<div class="kv"><span>Dépensé</span><strong>' + money(bt.spent) + "</strong></div>" +
      '<div class="kv"><span>Restant</span><strong>' + money(bt.remaining) + "</strong></div>" +
      '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
      '<button type="button" class="btn" data-action="goto" data-view="budget">Voir le détail du budget</button>';
  }

  function renderTasks() {
    $("#task-phases").innerHTML = state.phases.map((p) => {
      const list = state.tasks.filter((t) => t.phase === p.id);
      const done = list.filter((t) => t.done).length;
      const pct = list.length ? Math.round((done / list.length) * 100) : 0;
      const items = list.map((t) =>
        '<li class="task' + (t.done ? " done" : "") + '">' +
        '<label class="check"><input type="checkbox"' + (t.done ? " checked" : "") + ' data-action="toggle-task" data-id="' + t.id + '" /><span class="label">' + esc(t.label) + "</span></label>" +
        '<span class="row-btns"><button type="button" class="icon-btn" title="Modifier" data-action="edit-task" data-id="' + t.id + '">✎</button>' +
        '<button type="button" class="icon-btn" title="Supprimer" data-action="del-task" data-id="' + t.id + '">✕</button></span></li>'
      ).join("");
      return '<div class="card phase"><div class="phase-head"><h3>' + p.icon + " " + esc(p.name) + '</h3><span class="muted">' + done + "/" + list.length + "</span></div>" +
        '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
        '<ul class="task-list">' + (items || '<li class="empty">Aucune tâche dans cette phase.</li>') + "</ul></div>";
    }).join("");
  }

  function renderDocs() {
    const sorted = state.documents.slice().sort((a, b) => (a.expiry || "9999-12-31").localeCompare(b.expiry || "9999-12-31"));
    $("#doc-list").innerHTML = sorted.length
      ? sorted.map((d) => {
          const days = d.expiry ? daysUntil(d.expiry) : null;
          const warn = days !== null && days <= 60;
          return '<div class="card doc' + (warn ? " warn" : "") + '">' +
            '<div class="doc-top"><input class="doc-name" type="text" value="' + esc(d.name) + '" data-action="doc-set" data-id="' + d.id + '" data-field="name" />' +
            (warn ? '<span class="badge ' + (days < 0 ? "danger" : "warn") + '">' + (days < 0 ? "expiré" : "expire dans " + days + " j") + "</span>" : "") + "</div>" +
            '<div class="doc-fields"><select data-action="doc-set" data-id="' + d.id + '" data-field="type">' + DOC_TYPES.map((t) => '<option' + (t === d.type ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select>" +
            '<select data-action="doc-set" data-id="' + d.id + '" data-field="status">' + DOC_STATUSES.map((s) => '<option' + (s === d.status ? " selected" : "") + ">" + esc(s) + "</option>").join("") + "</select>" +
            '<label class="field-inline">Expiration <input type="date" value="' + (d.expiry || "") + '" data-action="doc-set" data-id="' + d.id + '" data-field="expiry" /></label></div>' +
            '<textarea class="doc-notes" rows="1" placeholder="Notes…" data-action="doc-set" data-id="' + d.id + '" data-field="notes">' + esc(d.notes || "") + "</textarea>" +
            '<div class="row-end"><button type="button" class="icon-btn" data-action="del-doc" data-id="' + d.id + '">✕ Supprimer</button></div></div>';
        }).join("")
      : '<p class="card empty">Aucun document. Ajoutez-en un ci-dessus.</p>';
  }

  function renderEvents() {
    const sorted = state.events.slice().sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31"));
    $("#event-list").innerHTML = sorted.length
      ? sorted.map((ev) =>
          '<div class="card event"><div class="event-main">' +
          '<input class="event-title" type="text" value="' + esc(ev.title) + '" data-action="event-set" data-id="' + ev.id + '" data-field="title" />' +
          '<input type="date" value="' + (ev.date || "") + '" data-action="event-set" data-id="' + ev.id + '" data-field="date" /></div>' +
          '<div class="event-sub">' + eventBadge(ev.date) +
          '<input class="event-note" type="text" placeholder="Notes…" value="' + esc(ev.note || "") + '" data-action="event-set" data-id="' + ev.id + '" data-field="note" />' +
          '<button type="button" class="icon-btn" data-action="del-event" data-id="' + ev.id + '">✕</button></div></div>'
        ).join("")
      : '<p class="card empty">Aucune échéance. Ajoutez-en une ci-dessus.</p>';
  }

  function renderBudget() {
    $("#budget-body").innerHTML = state.budget.length
      ? state.budget.map((b) => {
          const remaining = (Number(b.planned) || 0) - (Number(b.spent) || 0);
          return "<tr>" +
            '<td><input type="text" value="' + esc(b.label) + '" data-action="budget-set" data-id="' + b.id + '" data-field="label" /></td>' +
            '<td><input type="number" min="0" step="50" value="' + (Number(b.planned) || 0) + '" data-action="budget-set" data-id="' + b.id + '" data-field="planned" /></td>' +
            '<td><input type="number" min="0" step="50" value="' + (Number(b.spent) || 0) + '" data-action="budget-set" data-id="' + b.id + '" data-field="spent" /></td>' +
            '<td class="' + (remaining < 0 ? "negative" : "") + '">' + money(remaining) + "</td>" +
            '<td><button type="button" class="icon-btn" data-action="del-budget" data-id="' + b.id + '">✕</button></td></tr>';
        }).join("")
      : '<tr><td colspan="5" class="empty">Aucune ligne budgétaire.</td></tr>';
    const bt = budgetTotals();
    const pct = bt.planned ? Math.min(100, Math.round((bt.spent / bt.planned) * 100)) : 0;
    $("#budget-totals").innerHTML = "<tr><td><strong>Total</strong></td><td>" + money(bt.planned) + "</td><td>" + money(bt.spent) + '</td><td class="' + (bt.remaining < 0 ? "negative" : "") + '">' + money(bt.remaining) + "</td><td></td></tr>";
    const bar = $("#budget-bar");
    bar.style.width = pct + "%";
    bar.classList.toggle("over", bt.planned > 0 && bt.spent > bt.planned);
  }

  function renderResources() {
    const tags = ["tous"].concat(Array.from(new Set(state.resources.map((r) => r.tag))));
    $("#res-filter").innerHTML = tags.map((t) => '<option value="' + esc(t) + '"' + (t === resFilter ? " selected" : "") + ">" + (t === "tous" ? "Toutes les ressources" : esc(t)) + "</option>").join("");
    const list = state.resources.filter((r) => resFilter === "tous" || r.tag === resFilter);
    $("#res-list").innerHTML = list.map((r) =>
      '<div class="card res"><span class="chip">' + esc(r.tag) + '</span><h3>' + esc(r.title) + "</h3><p>" + esc(r.desc) + '</p>' +
      '<a class="res-link" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">Ouvrir le site ↗</a></div>'
    ).join("");
  }

  function renderSettings() {
    $("#set-departure").value = state.settings.departureDate || "";
    $("#set-pathway").value = state.settings.pathway || "";
  }

  function renderView(v) {
    if (v === "dashboard") renderDashboard();
    else if (v === "tasks") renderTasks();
    else if (v === "docs") renderDocs();
    else if (v === "calendar") renderEvents();
    else if (v === "budget") renderBudget();
    else if (v === "resources") renderResources();
    else if (v === "settings") renderSettings();
  }

  function showView(v) {
    currentView = v;
    $$(".view").forEach((el) => el.classList.toggle("active", el.id === "view-" + v));
    $$("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    renderView(v);
  }

  function populateStaticSelects() {
    $("#task-phase").innerHTML = state.phases.map((p) => '<option value="' + p.id + '">' + p.icon + " " + esc(p.name) + "</option>").join("");
    $("#doc-type").innerHTML = DOC_TYPES.map((t) => "<option>" + esc(t) + "</option>").join("");
    $("#doc-status").innerHTML = DOC_STATUSES.map((s) => "<option>" + esc(s) + "</option>").join("");
    $("#set-pathway").innerHTML = '<option value="">Non précisé</option>' + PATHWAYS.map((p) => '<option value="' + p.id + '">' + esc(p.label) + "</option>").join("");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "toronto-pret-export-" + todayISO() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.documents) || !Array.isArray(data.events) || !Array.isArray(data.budget)) throw new Error("format invalide");
        state = data;
        state.settings = state.settings || { departureDate: null, pathway: "" };
        save();
        populateStaticSelects();
        renderView(currentView);
        alert("Données importées avec succès.");
      } catch (err) {
        alert("Fichier invalide : impossible d'importer ces données.");
      }
    };
    reader.readAsText(file);
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    if (action === "nav" || action === "goto") {
      showView(el.dataset.view);
    } else if (action === "toggle-task") {
      const t = state.tasks.find((x) => x.id === el.dataset.id);
      if (t) { t.done = !t.done; save(); renderView(currentView); }
    } else if (action === "del-task") {
      state.tasks = state.tasks.filter((x) => x.id !== el.dataset.id);
      save(); renderView(currentView);
    } else if (action === "edit-task") {
      const t = state.tasks.find((x) => x.id === el.dataset.id);
      if (!t) return;
      const v = prompt("Modifier la tâche :", t.label);
      if (v && v.trim()) { t.label = v.trim(); save(); renderView(currentView); }
    } else if (action === "del-doc") {
      state.documents = state.documents.filter((x) => x.id !== el.dataset.id);
      save(); renderView(currentView);
    } else if (action === "del-event") {
      state.events = state.events.filter((x) => x.id !== el.dataset.id);
      save(); renderView(currentView);
    } else if (action === "del-budget") {
      state.budget = state.budget.filter((x) => x.id !== el.dataset.id);
      save(); renderView(currentView);
    } else if (action === "export") {
      exportJSON();
    } else if (action === "reset") {
      if (confirm("Réinitialiser toutes vos données ? Cette action est irréversible.")) {
        localStorage.removeItem(KEY);
        state = buildSeed();
        save();
        populateStaticSelects();
        renderView(currentView);
      }
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.id === "import-file") { importFile(el.files[0]); return; }
    if (el.id === "res-filter") { resFilter = el.value; renderResources(); return; }
    if (el.id === "set-departure") { state.settings.departureDate = el.value || null; save(); renderView(currentView); return; }
    if (el.id === "set-pathway") { state.settings.pathway = el.value; save(); renderView(currentView); return; }
    const act = el.dataset && el.dataset.action;
    if (act === "doc-set") {
      const d = state.documents.find((x) => x.id === el.dataset.id);
      if (!d) return;
      let v = el.value;
      if (el.dataset.field === "expiry") v = v || null;
      d[el.dataset.field] = v;
      save(); renderView(currentView);
    } else if (act === "event-set") {
      const ev = state.events.find((x) => x.id === el.dataset.id);
      if (!ev) return;
      let v = el.value;
      if (el.dataset.field === "date") v = v || null;
      ev[el.dataset.field] = v;
      save(); renderView(currentView);
    } else if (act === "budget-set") {
      const b = state.budget.find((x) => x.id === el.dataset.id);
      if (!b) return;
      if (el.dataset.field === "label") b.label = el.value;
      else { const n = parseFloat(el.value); b[el.dataset.field] = isNaN(n) ? 0 : n; }
      save(); renderView(currentView);
    }
  });

  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.id === "task-form") {
      e.preventDefault();
      const label = $("#task-label").value.trim();
      const phase = $("#task-phase").value;
      if (!label) return;
      state.tasks.push({ id: uid("t"), phase: phase, label: label, done: false });
      save(); f.reset(); renderView(currentView);
    } else if (f.id === "doc-form") {
      e.preventDefault();
      const name = $("#doc-name").value.trim();
      if (!name) return;
      state.documents.push({ id: uid("d"), name: name, type: $("#doc-type").value, status: $("#doc-status").value, expiry: $("#doc-expiry").value || null, notes: $("#doc-notes").value.trim() });
      save(); f.reset(); renderView(currentView);
    } else if (f.id === "event-form") {
      e.preventDefault();
      const title = $("#event-title").value.trim();
      const date = $("#event-date").value || null;
      if (!title || !date) return;
      state.events.push({ id: uid("e"), title: title, date: date, note: $("#event-note").value.trim() });
      save(); f.reset(); renderView(currentView);
    } else if (f.id === "budget-form") {
      e.preventDefault();
      const label = $("#budget-label").value.trim();
      if (!label) return;
      state.budget.push({ id: uid("b"), label: label, planned: parseFloat($("#budget-planned").value) || 0, spent: parseFloat($("#budget-spent").value) || 0 });
      save(); f.reset(); renderView(currentView);
    }
  });

  populateStaticSelects();
  showView("dashboard");
})();

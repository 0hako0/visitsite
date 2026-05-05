const STORAGE_KEYS = {
  destinations: "tripPalette.destinations",
  visited: "tripPalette.visitedRecords",
};

const list = document.querySelector(".destination-list");
const detailImage = document.querySelector("#detailImage");
const detailTitle = document.querySelector("#detailTitle");
const detailDescription = document.querySelector("#detailDescription");
const detailSeason = document.querySelector("#detailSeason");
const detailPriority = document.querySelector("#detailPriority");
const detailBudget = document.querySelector("#detailBudget");
const nearbyList = document.querySelector("#nearbyList");
const urlList = document.querySelector("#urlList");
const mapFrame = document.querySelector("#mapFrame");
const addDestinationForm = document.querySelector("#addDestinationForm");
const placeTodoForm = document.querySelector("#placeTodoForm");
const placeTodoInput = document.querySelector("#placeTodoInput");
const placeTodoList = document.querySelector("#placeTodoList");
const budgetForm = document.querySelector("#budgetForm");
const budgetInput = document.querySelector("#budgetInput");
const visitedForm = document.querySelector("#visitedForm");
const visitedList = document.querySelector("#visitedList");
const wishlistCount = document.querySelector("#wishlistCount");
const visitedCount = document.querySelector("#visitedCount");
const todoCount = document.querySelector("#todoCount");
const mapPins = [document.querySelector("#pinOne"), document.querySelector("#pinTwo"), document.querySelector("#pinThree")];

let destinations = loadItems(STORAGE_KEYS.destinations);
let visitedRecords = loadItems(STORAGE_KEYS.visited);
let activeDestination = destinations[0]?.id ?? null;

function loadItems(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function createId() {
  return `trip-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseUrls(value) {
  return parseLines(value).map((line) => {
    const [label, href] = line.includes("|") ? line.split("|").map((item) => item.trim()) : [line, line];
    return { label, href };
  });
}

function mapEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query || "日本")}&output=embed`;
}

function updateDashboard() {
  const allTodos = destinations.reduce((sum, destination) => sum + destination.todos.length, 0);
  wishlistCount.textContent = destinations.length;
  visitedCount.textContent = visitedRecords.length;
  todoCount.textContent = allTodos;

  mapPins.forEach((pin, index) => {
    pin.textContent = destinations[index]?.title ?? "未登録";
    pin.classList.toggle("is-muted", !destinations[index]);
  });
}

function renderDestinations() {
  if (!destinations.length) {
    list.innerHTML = `<div class="empty-state">まだ行きたい場所がありません。上のフォームから追加してください。</div>`;
    activeDestination = null;
    updateDetails(null);
    updateDashboard();
    return;
  }

  if (!destinations.some((destination) => destination.id === activeDestination)) {
    activeDestination = destinations[0].id;
  }

  list.innerHTML = destinations
    .map(
      (destination) => `
        <button class="destination-card ${destination.id === activeDestination ? "is-active" : ""}" type="button" data-id="${destination.id}">
          <span class="card-thumb" style="--accent: ${escapeHtml(destination.accent)}"></span>
          <span class="card-copy">
            <h3>${escapeHtml(destination.title)}</h3>
            <p>${escapeHtml(destination.description || "メモはまだありません")}</p>
            <small>${destination.todos.length}件のTODO / 予算: ${escapeHtml(destination.budget || "未設定")}</small>
          </span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => {
      activeDestination = card.dataset.id;
      renderDestinations();
      updateDetails(activeDestination);
    });
  });

  updateDetails(activeDestination);
  updateDashboard();
}

function updateDetails(id) {
  const destination = destinations.find((item) => item.id === id);

  if (!destination) {
    detailImage.style.setProperty("--accent", "linear-gradient(135deg, #dfeee5, #fffaf3)");
    detailTitle.textContent = "行きたい場所を追加してください";
    detailDescription.textContent = "場所を登録すると、地図・周辺スポット・参考URL・その場所でしたいTODO・予算メモをここで管理できます。";
    detailSeason.textContent = "未設定";
    detailPriority.textContent = "未設定";
    detailBudget.textContent = "未設定";
    budgetInput.value = "";
    nearbyList.innerHTML = "";
    urlList.innerHTML = "";
    placeTodoList.innerHTML = "";
    mapFrame.src = mapEmbedUrl("日本");
    placeTodoInput.disabled = true;
    budgetInput.disabled = true;
    return;
  }

  detailImage.style.setProperty("--accent", destination.accent);
  detailTitle.textContent = destination.title;
  detailDescription.textContent = destination.description || "メモはまだありません。";
  detailSeason.textContent = destination.season || "未設定";
  detailPriority.textContent = destination.priority || "未設定";
  detailBudget.textContent = destination.budget || "未設定";
  budgetInput.value = destination.budget || "";
  nearbyList.innerHTML = destination.nearby.length
    ? destination.nearby.map((spot) => `<li>${escapeHtml(spot)}</li>`).join("")
    : `<li>周辺スポットは未登録です。</li>`;
  urlList.innerHTML = destination.urls.length
    ? destination.urls
        .map((link) => `<li><a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></li>`)
        .join("")
    : `<li>参考URLは未登録です。</li>`;
  mapFrame.src = mapEmbedUrl(destination.mapQuery || destination.title);
  placeTodoInput.disabled = false;
  budgetInput.disabled = false;
  renderPlaceTodos(destination);
}

function renderPlaceTodos(destination) {
  if (!destination.todos.length) {
    placeTodoList.innerHTML = `<li class="empty-todo">この場所でしたいことは未登録です。</li>`;
    return;
  }

  placeTodoList.innerHTML = destination.todos
    .map(
      (todo) => `
        <li>
          <label>
            <input type="checkbox" data-todo-id="${todo.id}" ${todo.done ? "checked" : ""} />
            <span>${escapeHtml(todo.text)}</span>
          </label>
          <button class="text-button" type="button" data-delete-todo="${todo.id}">削除</button>
        </li>
      `,
    )
    .join("");

  placeTodoList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const todo = destination.todos.find((item) => item.id === checkbox.dataset.todoId);
      if (!todo) return;
      todo.done = checkbox.checked;
      saveItems(STORAGE_KEYS.destinations, destinations);
      renderDestinations();
    });
  });

  placeTodoList.querySelectorAll("[data-delete-todo]").forEach((button) => {
    button.addEventListener("click", () => {
      destination.todos = destination.todos.filter((todo) => todo.id !== button.dataset.deleteTodo);
      saveItems(STORAGE_KEYS.destinations, destinations);
      renderDestinations();
    });
  });
}

function renderVisitedRecords() {
  if (!visitedRecords.length) {
    visitedList.innerHTML = `<div class="empty-state dark">まだ行った記録がありません。フォームから写真付きで追加できます。</div>`;
    updateDashboard();
    return;
  }

  visitedList.innerHTML = visitedRecords
    .map(
      (record) => `
        <article>
          ${record.photo ? `<img class="visit-photo" src="${escapeHtml(record.photo)}" alt="${escapeHtml(record.title)}の写真" />` : ""}
          <time datetime="${escapeHtml(record.date)}">${escapeHtml(record.date || "日付未設定")}</time>
          <h3>${escapeHtml(record.title)}</h3>
          <p>${escapeHtml(record.note || "メモはまだありません。")}</p>
          <span class="mood">${escapeHtml(record.mood || "満足度未設定")}</span>
        </article>
      `,
    )
    .join("");
  updateDashboard();
}

async function readPhoto(form) {
  const file = form.visitedPhotoFile.files[0];
  if (file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  }

  return form.visitedPhotoUrl.value.trim();
}

addDestinationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.destinationTitle.value.trim();
  if (!title) return;

  const destination = {
    id: createId(),
    title,
    description: form.destinationDescription.value.trim(),
    season: form.destinationSeason.value.trim(),
    priority: form.destinationPriority.value,
    budget: form.destinationBudget.value.trim(),
    nearby: parseLines(form.destinationNearby.value),
    urls: parseUrls(form.destinationUrls.value),
    mapQuery: form.destinationMapQuery.value.trim() || title,
    todos: [],
    accent: `linear-gradient(135deg, hsl(${Math.floor(Math.random() * 360)} 70% 72%), #fff3d5)`,
  };

  destinations.unshift(destination);
  activeDestination = destination.id;
  saveItems(STORAGE_KEYS.destinations, destinations);
  form.reset();
  renderDestinations();
});

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = destinations.find((item) => item.id === activeDestination);
  if (!destination) return;
  destination.budget = budgetInput.value.trim();
  saveItems(STORAGE_KEYS.destinations, destinations);
  renderDestinations();
});

placeTodoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = destinations.find((item) => item.id === activeDestination);
  const text = placeTodoInput.value.trim();
  if (!destination || !text) return;

  destination.todos.push({ id: createId(), text, done: false });
  saveItems(STORAGE_KEYS.destinations, destinations);
  placeTodoInput.value = "";
  renderDestinations();
});

visitedForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.visitedTitle.value.trim();
  if (!title) return;

  visitedRecords.unshift({
    id: createId(),
    title,
    date: form.visitedDate.value,
    note: form.visitedNote.value.trim(),
    mood: form.visitedMood.value.trim(),
    photo: await readPhoto(form),
  });

  saveItems(STORAGE_KEYS.visited, visitedRecords);
  form.reset();
  renderVisitedRecords();
});

renderDestinations();
renderVisitedRecords();

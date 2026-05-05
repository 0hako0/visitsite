const destinations = [
  {
    id: "kamikochi",
    title: "上高地",
    category: "nature",
    categoryLabel: "自然",
    description: "澄んだ梓川と穂高連峰を眺めながら、半日ハイキングを楽しみたい場所。",
    season: "5月〜10月",
    priority: "★★★★★",
    budget: "交通 + 1泊",
    nearby: ["河童橋で写真を撮る", "明神池まで歩く", "平湯温泉に立ち寄る"],
    map: "https://www.google.com/maps?q=%E4%B8%8A%E9%AB%98%E5%9C%B0&output=embed",
    accent: "linear-gradient(135deg, #7fc8a9, #d5f2df)",
  },
  {
    id: "kanazawa",
    title: "金沢",
    category: "city",
    categoryLabel: "街歩き",
    description: "兼六園、茶屋街、現代アートを一日で巡るコンパクトな文化旅にしたい。",
    season: "3月〜5月",
    priority: "★★★★☆",
    budget: "新幹線 + 1泊",
    nearby: ["兼六園の朝散歩", "ひがし茶屋街で和菓子", "21世紀美術館を予約"],
    map: "https://www.google.com/maps?q=%E9%87%91%E6%B2%A2%E9%A7%85&output=embed",
    accent: "linear-gradient(135deg, #f4b860, #f8e6b0)",
  },
  {
    id: "miyako",
    title: "宮古島",
    category: "nature",
    categoryLabel: "自然",
    description: "透明度の高い海でシュノーケリングをして、橋を渡りながら絶景ドライブ。",
    season: "4月〜6月",
    priority: "★★★★★",
    budget: "航空券 + 2泊",
    nearby: ["与那覇前浜ビーチ", "伊良部大橋ドライブ", "島カフェで夕日を見る"],
    map: "https://www.google.com/maps?q=%E5%AE%AE%E5%8F%A4%E5%B3%B6&output=embed",
    accent: "linear-gradient(135deg, #4cc9f0, #c9f3ff)",
  },
  {
    id: "onomichi",
    title: "尾道",
    category: "food",
    categoryLabel: "グルメ",
    description: "坂道と猫の路地を歩き、尾道ラーメンと瀬戸内レモンスイーツを味わう。",
    season: "9月〜11月",
    priority: "★★★★☆",
    budget: "交通 + 日帰り",
    nearby: ["千光寺公園", "商店街で食べ歩き", "しまなみ海道を少し走る"],
    map: "https://www.google.com/maps?q=%E5%B0%BE%E9%81%93&output=embed",
    accent: "linear-gradient(135deg, #ff9770, #ffe0cc)",
  },
  {
    id: "naoshima",
    title: "直島",
    category: "art",
    categoryLabel: "アート",
    description: "島全体に点在する作品を、自転車とフェリーでゆっくり巡るアート旅。",
    season: "10月〜11月",
    priority: "★★★★★",
    budget: "交通 + 1泊",
    nearby: ["地中美術館を事前予約", "家プロジェクト", "港で夕景を見る"],
    map: "https://www.google.com/maps?q=%E7%9B%B4%E5%B3%B6&output=embed",
    accent: "linear-gradient(135deg, #9b5de5, #eadcff)",
  },
];

const initialTodos = ["朝の時間に写真を撮る", "ご当地の市場で朝食を食べる", "旅先のスタンプやチケットを残す"];

const list = document.querySelector(".destination-list");
const tabs = document.querySelectorAll(".tab");
const detailImage = document.querySelector("#detailImage");
const detailCategory = document.querySelector("#detailCategory");
const detailTitle = document.querySelector("#detailTitle");
const detailDescription = document.querySelector("#detailDescription");
const detailSeason = document.querySelector("#detailSeason");
const detailPriority = document.querySelector("#detailPriority");
const detailBudget = document.querySelector("#detailBudget");
const nearbyList = document.querySelector("#nearbyList");
const mapFrame = document.querySelector("#mapFrame");
const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");

let activeDestination = destinations[0].id;

function renderDestinations(filter = "all") {
  const filtered = filter === "all" ? destinations : destinations.filter((destination) => destination.category === filter);

  if (!filtered.some((destination) => destination.id === activeDestination)) {
    activeDestination = filtered[0]?.id ?? destinations[0].id;
  }

  list.innerHTML = filtered
    .map(
      (destination) => `
        <button class="destination-card ${destination.id === activeDestination ? "is-active" : ""}" type="button" data-id="${destination.id}">
          <span class="card-thumb" style="--accent: ${destination.accent}"></span>
          <span class="card-copy">
            <span class="badge">${destination.categoryLabel}</span>
            <h3>${destination.title}</h3>
            <p>${destination.description}</p>
          </span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => {
      activeDestination = card.dataset.id;
      renderDestinations(filter);
      updateDetails(activeDestination);
    });
  });

  updateDetails(activeDestination);
}

function updateDetails(id) {
  const destination = destinations.find((item) => item.id === id) ?? destinations[0];
  detailImage.style.setProperty("--accent", destination.accent);
  detailCategory.textContent = destination.categoryLabel;
  detailTitle.textContent = destination.title;
  detailDescription.textContent = destination.description;
  detailSeason.textContent = destination.season;
  detailPriority.textContent = destination.priority;
  detailBudget.textContent = destination.budget;
  nearbyList.innerHTML = destination.nearby.map((spot) => `<li>${spot}</li>`).join("");
  mapFrame.src = destination.map;
}

function renderTodo(text, checked = false) {
  const item = document.createElement("li");
  item.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""} aria-label="${text}を完了にする" /><span>${text}</span>`;
  todoList.appendChild(item);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    renderDestinations(tab.dataset.filter);
  });
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = todoInput.value.trim();
  if (!value) return;
  renderTodo(value);
  todoInput.value = "";
});

initialTodos.forEach((todo, index) => renderTodo(todo, index === 2));
renderDestinations();

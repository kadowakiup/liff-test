// GAS経由でshiftData取得＋カレンダー表示
window.onload = async function () {
  const calendarDiv = document.getElementById("calendar");
  const currentMonthSpan = document.getElementById("currentMonth");
  const updateButton = document.getElementById("updateButton");
  const resultDiv = document.getElementById("result");
  const firstMessageDiv = document.getElementById("firstMessage");
  const monthNavDiv = document.getElementById("monthNav");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  // 詳細
  const calendarView = document.getElementById("calendarView");
  const detailView = document.getElementById("detailView");
  const detailDate = document.getElementById("detailDate");
  const detailShift = document.getElementById("detailShift");

  const backButton = document.getElementById("backButton");
  const btnEdit = document.getElementById("btnEdit");
  const saveEdit = document.getElementById("saveEdit");
  const editError = document.getElementById("editError");

  const editArea = document.getElementById("editArea");
  const startSelect = document.getElementById("startTime");
  const endSelect = document.getElementById("endTime");

  let shiftData = {};
  let currentDate = new Date();

  // 元シフト保持
  let originalStart = "";
  let originalEnd = "";

  // LIFF初期化
  await liff.init({ liffId: "2009569390-ToBfmkCN" });

  // =====================
  // カレンダー生成
  // =====================
  function generateCalendar(date) {
    calendarDiv.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day";
      calendarDiv.appendChild(empty);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const fullDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const dateSpan = document.createElement("span");
      dateSpan.className = "date";
      dateSpan.textContent = day;
      dayDiv.appendChild(dateSpan);

      if (shiftData[fullDateStr]) {
        const shiftSpan = document.createElement("div");
        shiftSpan.className = "shift-time";
        shiftSpan.textContent = shiftData[fullDateStr];

        shiftSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          openDetail(fullDateStr, shiftData[fullDateStr]);
        });

        dayDiv.appendChild(shiftSpan);
      }

      calendarDiv.appendChild(dayDiv);
    }
  }

  // =====================
  // 詳細表示
  // =====================
  function openDetail(date, shift) {
    calendarView.style.display = "none";
    detailView.style.display = "block";

    detailDate.textContent = date;
    detailShift.textContent = shift || "なし";

    editArea.style.display = "none";
    editError.textContent = "";

    if (shift) {
      const parts = shift.split("-");
      originalStart = parts[0];
      originalEnd = parts[1];
    }
  }

  backButton.addEventListener("click", () => {
    detailView.style.display = "none";
    calendarView.style.display = "block";
  });

  // =====================
  // プルダウン生成（最重要）
  // =====================
  function generateTimeOptions() {
    startSelect.innerHTML = "";
    endSelect.innerHTML = "";

    const startRules = {
      12: ["00","15","30","45"],
      13: ["00","15","30","45"],
      15: ["00","15","30","45"],
      16: ["00","15","30"],
      17: ["00","15","30","45"],
      18: ["00","15","30"],
      19: ["00","15","30","45"],
      20: ["00","15","30","45"]
    };

    const endRules = {
      12: ["15","30","45"],
      13: ["00","15","30","45"],
      14: ["00"],
      15: ["15","30","45"],
      16: ["00","15","30","45"],
      17: ["00","15","30","45"],
      18: ["00","15","30","45"],
      19: ["00","15","30","45"],
      20: ["00","15","30","45"],
      21: ["00"]
    };

    const now = new Date();
    const selectedDate = detailDate.textContent;

    // 出勤
    for (let h in startRules) {
      for (let m of startRules[h]) {
        const time = `${h.padStart(2,"0")}:${m}`;
        const dt = new Date(`${selectedDate} ${time}`);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        startSelect.appendChild(opt);
      }
    }

    // 退勤
    for (let h in endRules) {
      for (let m of endRules[h]) {
        const time = `${h.padStart(2,"0")}:${m}`;
        const dt = new Date(`${selectedDate} ${time}`);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        endSelect.appendChild(opt);
      }
    }

    // デフォルトは「変更なし」
    const defaultStart = document.createElement("option");
    defaultStart.value = originalStart;
    defaultStart.textContent = "変更なし";
    defaultStart.selected = true;
    startSelect.prepend(defaultStart);

    const defaultEnd = document.createElement("option");
    defaultEnd.value = originalEnd;
    defaultEnd.textContent = "変更なし";
    defaultEnd.selected = true;
    endSelect.prepend(defaultEnd);
  }

  // =====================
  // 時間変更クリック
  // =====================
  btnEdit.addEventListener("click", () => {
    editArea.style.display = "block";
    generateTimeOptions();
  });

  // =====================
  // 保存処理（確認ポップアップ＋GAS経由更新）
  // =====================
  saveEdit.addEventListener("click", async () => {
    const start = startSelect.value;
    const end = endSelect.value;
    const selectedDate = detailDate.textContent;

    // 「変更なし」の場合は元の値を使用
    const newStart = start === originalStart ? originalStart : start;
    const newEnd = end === originalEnd ? originalEnd : end;

    const now = new Date();
    const startDt = new Date(`${selectedDate} ${newStart}`);
    const endDt = new Date(`${selectedDate} ${newEnd}`);
    const originalEndDt = new Date(`${selectedDate} ${originalEnd}`);

    editError.textContent = "";

    // ルールチェック
    if (startDt < now || endDt < now) {
      editError.textContent = "シフト変更時間を過ぎています。公式LINEに相談してください";
      return;
    }
    if (originalEndDt < now) {
      editError.textContent = "このシフトは変更できません。公式LINEに相談してください";
      return;
    }
    if (startDt >= endDt) {
      editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
      return;
    }

    if (!confirm("このシフト変更を保存してもよろしいですか？")) return;

    try {
      resultDiv.textContent = "保存中…";

      const profile = await liff.getProfile();
      const payload = {
        userId: profile.userId,
        date: selectedDate,
        start: newStart,
        end: newEnd
      };

      const res = await fetch("GAS_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("保存リクエスト失敗");

      const data = await res.json();
      shiftData[selectedDate] = `${newStart}-${newEnd}`;

      detailShift.textContent = shiftData[selectedDate];
      editArea.style.display = "none";

      alert("シフトを保存しました");
      resultDiv.textContent = "";
      generateCalendar(currentDate);
      detailView.style.display = "none";
      calendarView.style.display = "block";

    } catch (err) {
      alert("保存中にエラーが発生しました: " + err.message);
    }
  });

  // =====================
  // 更新ボタン
  // =====================
  updateButton.addEventListener("click", async () => {
    try {
      const profile = await liff.getProfile();
      const res = await fetch("GAS_URL?userId=" + profile.userId);
      const data = await res.json();

      shiftData = data.shifts || {};

      firstMessageDiv.style.display = "none";
      monthNavDiv.style.display = "flex";

      generateCalendar(currentDate);
    } catch (err) {
      resultDiv.textContent = "取得エラー: " + err.message;
    }
  });

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
  });
};
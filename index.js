window.onload = async function () {
  const calendarDiv = document.getElementById("calendar");
  const currentMonthSpan = document.getElementById("currentMonth");
  const updateButton = document.getElementById("updateButton");
  const resultDiv = document.getElementById("result");
  const firstMessageDiv = document.getElementById("firstMessage");
  const monthNavDiv = document.getElementById("monthNav");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  // 詳細画面
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

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

  // ここ！
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  let shiftData = {};
  let currentDate = new Date();

  // 選択中シフト情報
  let selectedShiftId = "";
  let selectedDateStr = "";
  let originalStart = "";
  let originalEnd = "";

  // LIFF初期化
  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" });

    // ログイン（開発のため）
    resultDiv.style.color = "black";
    resultDiv.innerHTML =
      "LIFF初期化成功<br>" +
      "isInClient: " + liff.isInClient() + "<br>" +
      "isLoggedIn: " + liff.isLoggedIn();

    if (!liff.isLoggedIn()) {
      resultDiv.innerHTML += "<br>LINEログインへ移動します…";
      liff.login({
        redirectUri: window.location.href
      });
      return;
    }

  } catch (err) {
    console.error(err);
    resultDiv.textContent = "LIFF初期化エラー: " + err.message;
    return;
  }

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

    // 曜日分の空白
    for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "day";
      calendarDiv.appendChild(emptyDiv);
    }

    // 日付セル
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const fullDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const dateSpan = document.createElement("span");
      dateSpan.className = "date";
      dateSpan.textContent = day;
      dayDiv.appendChild(dateSpan);

      const dayShifts = shiftData[fullDateStr] || [];

      dayShifts.forEach((shift) => {
        const shiftSpan = document.createElement("div");
        shiftSpan.className = "shift-time";
        shiftSpan.textContent = `${shift.start}-${shift.end}`;

        shiftSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          openDetail(fullDateStr, shift);
        });

        dayDiv.appendChild(shiftSpan);
      });

      calendarDiv.appendChild(dayDiv);
    }
  }

  // =====================
  // 詳細表示
  // =====================
  function openDetail(date, shift) {
    calendarView.style.display = "none";
    detailView.style.display = "block";

    selectedDateStr = date;
    selectedShiftId = shift.id;
    originalStart = shift.start;
    originalEnd = shift.end;

    detailDate.textContent = date;
    detailShift.textContent = `${shift.start}-${shift.end}`;

    editArea.style.display = "none";
    editError.textContent = "";
  }

  // 戻る
  backButton.addEventListener("click", () => {
    detailView.style.display = "none";
    calendarView.style.display = "block";
  });

  // =====================
  // プルダウン生成
  // =====================
  function generateTimeOptions() {
    startSelect.innerHTML = "";
    endSelect.innerHTML = "";

    const startRules = {
      12: ["00", "15", "30", "45"],
      13: ["00", "15", "30", "45"],
      15: ["00", "15", "30", "45"],
      16: ["00", "15", "30"],
      17: ["00", "15", "30", "45"],
      18: ["00", "15", "30"],
      19: ["00", "15", "30", "45"],
      20: ["00", "15", "30", "45"]
    };

    const endRules = {
      12: ["15", "30", "45"],
      13: ["00", "15", "30", "45"],
      14: ["00"],
      15: ["15", "30", "45"],
      16: ["00", "15", "30", "45"],
      17: ["00", "15", "30", "45"],
      18: ["00", "15", "30", "45"],
      19: ["00", "15", "30", "45"],
      20: ["00", "15", "30", "45"],
      21: ["00"]
    };

    const now = new Date();

    // 出勤のデフォルト
    const defaultStart = document.createElement("option");
    defaultStart.value = originalStart;
    defaultStart.textContent = "変更なし";
    defaultStart.selected = true;
    startSelect.appendChild(defaultStart);

    // 退勤のデフォルト
    const defaultEnd = document.createElement("option");
    defaultEnd.value = originalEnd;
    defaultEnd.textContent = "変更なし";
    defaultEnd.selected = true;
    endSelect.appendChild(defaultEnd);

    // 出勤候補
    for (const h in startRules) {
      for (const m of startRules[h]) {
        const time = `${String(h).padStart(2, "0")}:${m}`;
        const dt = new Date(`${selectedDateStr}T${time}:00`);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        startSelect.appendChild(opt);
      }
    }

    // 退勤候補
    for (const h in endRules) {
      for (const m of endRules[h]) {
        const time = `${String(h).padStart(2, "0")}:${m}`;
        const dt = new Date(`${selectedDateStr}T${time}:00`);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        endSelect.appendChild(opt);
      }
    }
  }

  // 時間変更ボタン
  btnEdit.addEventListener("click", () => {
    editArea.style.display = "block";
    generateTimeOptions();
  });

  // =====================
  // 保存処理
  // =====================
  saveEdit.addEventListener("click", async () => {
    const start = startSelect.value;
    const end = endSelect.value;

    const newStart = start === originalStart ? originalStart : start;
    const newEnd = end === originalEnd ? originalEnd : end;

    const now = new Date();
    const startDt = new Date(`${selectedDateStr}T${newStart}:00`);
    const endDt = new Date(`${selectedDateStr}T${newEnd}:00`);
    const originalEndDt = new Date(`${selectedDateStr}T${originalEnd}:00`);

    editError.textContent = "";

    const startChanged = newStart !== originalStart;
    const endChanged = newEnd !== originalEnd;

    // 出勤チェック
    if (startChanged && startDt < now) {
      editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
      return;
    }

    // 退勤チェック
    if (endChanged && (endDt < now || originalEndDt < now)) {
      editError.textContent = "退勤時間は変更できません。公式LINEに相談してください";
      return;
    }

    // 時間前後チェック
    if (startDt >= endDt) {
      editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
      return;
    }

    if (!confirm("このシフト変更を保存してもよろしいですか？")) {
      return;
    }

    try {
      resultDiv.textContent = "保存中…";

      const profile = await liff.getProfile();

      const url =
        GAS_URL +
        "?action=update" +
        "&userId=" + encodeURIComponent(profile.userId) +
        "&shiftId=" + encodeURIComponent(selectedShiftId) +
        "&date=" + encodeURIComponent(selectedDateStr) +
        "&start=" + encodeURIComponent(newStart) +
        "&end=" + encodeURIComponent(newEnd);

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        editError.textContent = data.message || "時間変更に失敗しました";
        resultDiv.textContent = "";
        return;
      }

      // 表示データ更新
      const dayShifts = shiftData[selectedDateStr] || [];
      const targetShift = dayShifts.find((s) => s.id === selectedShiftId);

      if (targetShift) {
        targetShift.start = newStart;
        targetShift.end = newEnd;
      }

      detailShift.textContent = `${newStart}-${newEnd}`;
      editArea.style.display = "none";

      alert(data.message || "シフトを保存しました");

      resultDiv.textContent = "";
      generateCalendar(currentDate);
      detailView.style.display = "none";
      calendarView.style.display = "block";

    } catch (err) {
      console.error(err);
      editError.textContent = "保存中にエラーが発生しました";
      resultDiv.textContent = "";
    }
  });

  // =====================
  // 更新ボタン
  // =====================
  updateButton.addEventListener("click", async () => {
    try {
      resultDiv.textContent = "更新中…";

      const profile = await liff.getProfile();

      const url =
        GAS_URL +
        "?action=fetch" +
        "&userId=" + encodeURIComponent(profile.userId) +
        "&name=" + encodeURIComponent(profile.displayName);

      const res = await fetch(url);
      const data = await res.json();

      shiftData = data.shifts || {};

      firstMessageDiv.style.display = "none";
      monthNavDiv.style.display = "flex";
      resultDiv.textContent = "";

      generateCalendar(currentDate);

    } catch (err) {
      console.error(err);
      resultDiv.textContent = "取得エラー: " + err.message;
    }
  });

  // 前月
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
  });

  // 翌月
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
  });
};
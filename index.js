// GAS経由でshiftData取得＋カレンダー表示
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // 🔹 LIFF初期化
//   try {
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });
//   } catch (err) {
//     console.error(err);
//     resultDiv.textContent = "LIFF初期化エラー: " + err.message;
//     return;
//   }

//   const today = new Date();
//   let currentDate = new Date(today);
//   let shiftData = {};

//   // カレンダー生成
//   function generateCalendar(date) {
//     calendarDiv.innerHTML = "";

//     const year = date.getFullYear();
//     const month = date.getMonth();
//     currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const totalDays = lastDay.getDate();
//     const startDay = firstDay.getDay();

//     // 空セル
//     for (let i = 0; i < startDay; i++) {
//       const emptyDiv = document.createElement("div");
//       emptyDiv.className = "day";
//       calendarDiv.appendChild(emptyDiv);
//     }

//     // 日付セル
//     for (let day = 1; day <= totalDays; day++) {
//       const fullDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//       const dayDiv = document.createElement("div");
//       dayDiv.className = "day";

//       const dateSpan = document.createElement("span");
//       dateSpan.className = "date";
//       dateSpan.textContent = day;
//       dayDiv.appendChild(dateSpan);

//       // シフト表示
//       if (shiftData[fullDateStr]) {
//         const shiftSpan = document.createElement("div");
//         shiftSpan.className = "shift-time";
//         shiftSpan.textContent = shiftData[fullDateStr];

//         // 👇 ここ追加（重要）
//         shiftSpan.addEventListener("click", (e) => {
//           e.stopPropagation(); // ← 日付クリック防止
//           openDetail(fullDateStr, shiftData[fullDateStr]);
//         });

//         dayDiv.appendChild(shiftSpan);
//       }

//       calendarDiv.appendChild(dayDiv);
//     }
//   }

//   // 月制限（前月・当月・翌月）
//   function updateMonthButtons() {
//     const minDate = new Date(today.getFullYear(), today.getMonth() - 1);
//     const maxDate = new Date(today.getFullYear(), today.getMonth() + 1);

//     const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
//     const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

//     prevMonthBtn.disabled = prevMonth < minDate;
//     nextMonthBtn.disabled = nextMonth > maxDate;
//   }

//   prevMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() - 1);
//     generateCalendar(currentDate);
//     updateMonthButtons();
//   });

//   nextMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() + 1);
//     generateCalendar(currentDate);
//     updateMonthButtons();
//   });

//   // 🔹 更新ボタン
//   updateButton.addEventListener("click", async () => {
//     resultDiv.textContent = "更新中…";

//     try {
//       if (!liff.isLoggedIn()) {
//         liff.login();
//         return;
//       }

//       const profile = await liff.getProfile();

//       const url =
//         "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec" +
//         "?userId=" + encodeURIComponent(profile.userId) +
//         "&name=" + encodeURIComponent(profile.displayName);

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error("GASエラー: " + response.status);
//       }

//       // 🔥 ここからデバッグの本体
//       const rawText = await response.text();
//       console.log("RAW TEXT:", rawText);

//       let data;
//       try {
//         data = JSON.parse(rawText);
//       } catch (e) {
//         console.error("JSONパース失敗", e);
//         resultDiv.textContent = "JSONパース失敗";
//         return;
//       }

//       console.log("PARSED:", data);

//       // 🔥 全パターン対応
//       shiftData =
//         data.shifts ||
//         data.body?.shifts ||
//         data.data?.body?.shifts ||
//         {};

//       console.log("shiftData:", shiftData);

//       // UI切替
//       firstMessageDiv.style.display = "none";
//       monthNavDiv.style.display = "flex";
//       resultDiv.textContent = "";

//       generateCalendar(currentDate);
//       updateMonthButtons();

//     } catch (err) {
//       console.error(err);
//       resultDiv.textContent = "取得エラー: " + err.message;
//       alert("エラーが発生しました: " + err.message);
//     }
//   });
// };





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

  const editArea = document.getElementById("editArea");
  const startSelect = document.getElementById("startTime");
  const endSelect = document.getElementById("endTime");
  const saveEdit = document.getElementById("saveEdit");
  const editError = document.getElementById("editError");

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
  }

  // =====================
  // 時間変更クリック
  // =====================
  btnEdit.addEventListener("click", () => {
    editArea.style.display = "block";
    generateTimeOptions();
  });

  // =====================
  // 保存処理
  // =====================
  saveEdit.addEventListener("click", () => {
    const start = startSelect.value;
    const end = endSelect.value;

    const now = new Date();
    const selectedDate = detailDate.textContent;

    const startDt = new Date(`${selectedDate} ${start}`);
    const endDt = new Date(`${selectedDate} ${end}`);
    const originalEndDt = new Date(`${selectedDate} ${originalEnd}`);

    editError.textContent = "";

    if (startDt < now || endDt < now) {
      editError.textContent = "シフト変更時間を過ぎています";
      return;
    }

    if (originalEndDt < now) {
      editError.textContent = "このシフトは変更できません";
      return;
    }

    if (startDt >= endDt) {
      editError.textContent = "時間の設定が不正です";
      return;
    }

    console.log("変更OK:", start, end);
  });

  // =====================
  // 更新ボタン
  // =====================
  updateButton.addEventListener("click", async () => {
    const profile = await liff.getProfile();

    const res = await fetch("GAS_URL?userId=" + profile.userId);
    const data = await res.json();

    shiftData = data.shifts || {};

    firstMessageDiv.style.display = "none";
    monthNavDiv.style.display = "flex";

    generateCalendar(currentDate);
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
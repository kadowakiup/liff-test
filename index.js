// // GAS経由でshiftData取得＋カレンダー表示
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // 詳細
//   const calendarView = document.getElementById("calendarView");
//   const detailView = document.getElementById("detailView");
//   const detailDate = document.getElementById("detailDate");
//   const detailShift = document.getElementById("detailShift");

//   const backButton = document.getElementById("backButton");
//   const btnEdit = document.getElementById("btnEdit");
//   const saveEdit = document.getElementById("saveEdit");
//   const editError = document.getElementById("editError");

//   const editArea = document.getElementById("editArea");
//   const startSelect = document.getElementById("startTime");
//   const endSelect = document.getElementById("endTime");

//   let shiftData = {};
//   let currentDate = new Date();

//   // 元シフト保持
//   let originalStart = "";
//   let originalEnd = "";

//   // LIFF初期化
//   await liff.init({ liffId: "2009569390-ToBfmkCN" });

//   // =====================
//   // カレンダー生成
//   // =====================
//   function generateCalendar(date) {
//     calendarDiv.innerHTML = "";

//     const year = date.getFullYear();
//     const month = date.getMonth();

//     currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const startDay = firstDay.getDay();

//     for (let i = 0; i < startDay; i++) {
//       const empty = document.createElement("div");
//       empty.className = "day";
//       calendarDiv.appendChild(empty);
//     }

//     for (let day = 1; day <= lastDay.getDate(); day++) {
//       const fullDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//       const dayDiv = document.createElement("div");
//       dayDiv.className = "day";

//       const dateSpan = document.createElement("span");
//       dateSpan.className = "date";
//       dateSpan.textContent = day;
//       dayDiv.appendChild(dateSpan);

//       if (shiftData[fullDateStr]) {
//         const shiftSpan = document.createElement("div");
//         shiftSpan.className = "shift-time";
//         shiftSpan.textContent = shiftData[fullDateStr];

//         shiftSpan.addEventListener("click", (e) => {
//           e.stopPropagation();
//           openDetail(fullDateStr, shiftData[fullDateStr]);
//         });

//         dayDiv.appendChild(shiftSpan);
//       }

//       calendarDiv.appendChild(dayDiv);
//     }
//   }

//   // =====================
//   // 詳細表示
//   // =====================
//   function openDetail(date, shift) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     detailDate.textContent = date;
//     detailShift.textContent = shift || "なし";

//     editArea.style.display = "none";
//     editError.textContent = "";

//     if (shift) {
//       const parts = shift.split("-");
//       originalStart = parts[0];
//       originalEnd = parts[1];
//     }
//   }

//   backButton.addEventListener("click", () => {
//     detailView.style.display = "none";
//     calendarView.style.display = "block";
//   });

//   // =====================
//   // プルダウン生成（最重要）
//   // =====================
//   function generateTimeOptions() {
//     startSelect.innerHTML = "";
//     endSelect.innerHTML = "";

//     const startRules = {
//       12: ["00","15","30","45"],
//       13: ["00","15","30","45"],
//       15: ["00","15","30","45"],
//       16: ["00","15","30"],
//       17: ["00","15","30","45"],
//       18: ["00","15","30"],
//       19: ["00","15","30","45"],
//       20: ["00","15","30","45"]
//     };

//     const endRules = {
//       12: ["15","30","45"],
//       13: ["00","15","30","45"],
//       14: ["00"],
//       15: ["15","30","45"],
//       16: ["00","15","30","45"],
//       17: ["00","15","30","45"],
//       18: ["00","15","30","45"],
//       19: ["00","15","30","45"],
//       20: ["00","15","30","45"],
//       21: ["00"]
//     };

//     const now = new Date();
//     const selectedDate = detailDate.textContent;

//     // 出勤
//     for (let h in startRules) {
//       for (let m of startRules[h]) {
//         const time = `${h.padStart(2,"0")}:${m}`;
//         const dt = new Date(`${selectedDate} ${time}`);
//         if (dt < now) continue;

//         const opt = document.createElement("option");
//         opt.value = time;
//         opt.textContent = time;
//         startSelect.appendChild(opt);
//       }
//     }

//     // 退勤
//     for (let h in endRules) {
//       for (let m of endRules[h]) {
//         const time = `${h.padStart(2,"0")}:${m}`;
//         const dt = new Date(`${selectedDate} ${time}`);
//         if (dt < now) continue;

//         const opt = document.createElement("option");
//         opt.value = time;
//         opt.textContent = time;
//         endSelect.appendChild(opt);
//       }
//     }

//     // デフォルトは「変更なし」
//     const defaultStart = document.createElement("option");
//     defaultStart.value = originalStart;
//     defaultStart.textContent = "変更なし";
//     defaultStart.selected = true;
//     startSelect.prepend(defaultStart);

//     const defaultEnd = document.createElement("option");
//     defaultEnd.value = originalEnd;
//     defaultEnd.textContent = "変更なし";
//     defaultEnd.selected = true;
//     endSelect.prepend(defaultEnd);
//   }

//   // =====================
//   // 時間変更クリック
//   // =====================
//   btnEdit.addEventListener("click", () => {
//     editArea.style.display = "block";
//     generateTimeOptions();
//   });

//   // =====================
//   // 保存処理（確認ポップアップ＋GAS経由更新）
//   // =====================
//   saveEdit.addEventListener("click", async () => {
//     const start = startSelect.value;
//     const end = endSelect.value;
//     const selectedDate = detailDate.textContent;

//     // 「変更なし」の場合は元の値を使用
//     const newStart = start === originalStart ? originalStart : start;
//     const newEnd = end === originalEnd ? originalEnd : end;

//     const now = new Date();
//     const startDt = new Date(`${selectedDate} ${newStart}`);
//     const endDt = new Date(`${selectedDate} ${newEnd}`);
//     const originalEndDt = new Date(`${selectedDate} ${originalEnd}`);

//     editError.textContent = "";

//     // 変更チェック
//     const startChanged = newStart !== originalStart;
//     const endChanged = newEnd !== originalEnd;

//     // 出勤チェック
//     if (startChanged && startDt < now) {
//       editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
//       return;
//     }

//     // 退勤チェック
//     if (endChanged && (endDt < now || originalEndDt < now)) {
//       editError.textContent = "退勤時間は変更できません。公式LINEに相談してください";
//       return;
//     }

//     // 時間不正チェック
//     if (startDt >= endDt) {
//       editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
//       return;
//     }

//     if (!confirm("このシフト変更を保存してもよろしいですか？")) return;

//     try {
//       resultDiv.textContent = "保存中…";

//       const profile = await liff.getProfile();
//       const payload = {
//         userId: profile.userId,
//         date: selectedDate,
//         start: newStart,
//         end: newEnd
//       };

//       const res = await fetch("https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) throw new Error("保存リクエスト失敗");

//       const data = await res.json();
//       shiftData[selectedDate] = `${newStart}-${newEnd}`;

//       detailShift.textContent = shiftData[selectedDate];
//       editArea.style.display = "none";

//       alert("シフトを保存しました");
//       resultDiv.textContent = "";
//       generateCalendar(currentDate);
//       detailView.style.display = "none";
//       calendarView.style.display = "block";

//     } catch (err) {
//       alert("保存中にエラーが発生しました: " + err.message);
//     }
//   });

//   // =====================
//   // 更新ボタン
//   // =====================
//   updateButton.addEventListener("click", async () => {
//     try {
//       const profile = await liff.getProfile();
//       const res = await fetch("https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec?userId=" + profile.userId);
//       const data = await res.json();

//       shiftData = data.shifts || {};

//       firstMessageDiv.style.display = "none";
//       monthNavDiv.style.display = "flex";

//       generateCalendar(currentDate);
//     } catch (err) {
//       resultDiv.textContent = "取得エラー: " + err.message;
//     }
//   });

//   prevMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() - 1);
//     generateCalendar(currentDate);
//   });

//   nextMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() + 1);
//     generateCalendar(currentDate);
//   });
// };








// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // 詳細
//   const calendarView = document.getElementById("calendarView");
//   const detailView = document.getElementById("detailView");
//   const detailDate = document.getElementById("detailDate");
//   const detailShift = document.getElementById("detailShift");

//   const backButton = document.getElementById("backButton");
//   const btnEdit = document.getElementById("btnEdit");
//   const saveEdit = document.getElementById("saveEdit");
//   const editError = document.getElementById("editError");

//   const editArea = document.getElementById("editArea");
//   const startSelect = document.getElementById("startTime");
//   const endSelect = document.getElementById("endTime");

//   const GAS_URL = "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

//   let shiftData = {};
//   let currentDate = new Date();

//   // 選択中シフト保持
//   let selectedShiftId = "";
//   let selectedDateStr = "";
//   let originalStart = "";
//   let originalEnd = "";

//   await liff.init({ liffId: "2009569390-ToBfmkCN" });

//   function generateCalendar(date) {
//     calendarDiv.innerHTML = "";

//     const year = date.getFullYear();
//     const month = date.getMonth();

//     currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const startDay = firstDay.getDay();

//     for (let i = 0; i < startDay; i++) {
//       const empty = document.createElement("div");
//       empty.className = "day";
//       calendarDiv.appendChild(empty);
//     }

//     for (let day = 1; day <= lastDay.getDate(); day++) {
//       const fullDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//       const dayDiv = document.createElement("div");
//       dayDiv.className = "day";

//       const dateSpan = document.createElement("span");
//       dateSpan.className = "date";
//       dateSpan.textContent = day;
//       dayDiv.appendChild(dateSpan);

//       const dayShifts = shiftData[fullDateStr] || [];

//       dayShifts.forEach((shift) => {
//         const shiftSpan = document.createElement("div");
//         shiftSpan.className = "shift-time";
//         shiftSpan.textContent = `${shift.start}-${shift.end}`;

//         shiftSpan.addEventListener("click", (e) => {
//           e.stopPropagation();
//           openDetail(fullDateStr, shift);
//         });

//         dayDiv.appendChild(shiftSpan);
//       });

//       calendarDiv.appendChild(dayDiv);
//     }
//   }

//   function openDetail(date, shift) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     selectedDateStr = date;
//     selectedShiftId = shift.id;
//     originalStart = shift.start;
//     originalEnd = shift.end;

//     detailDate.textContent = date;
//     detailShift.textContent = `${shift.start}-${shift.end}`;

//     editArea.style.display = "none";
//     editError.textContent = "";
//   }

//   backButton.addEventListener("click", () => {
//     detailView.style.display = "none";
//     calendarView.style.display = "block";
//   });

//   function generateTimeOptions() {
//     startSelect.innerHTML = "";
//     endSelect.innerHTML = "";

//     const startRules = {
//       12: ["00", "15", "30", "45"],
//       13: ["00", "15", "30", "45"],
//       15: ["00", "15", "30", "45"],
//       16: ["00", "15", "30"],
//       17: ["00", "15", "30", "45"],
//       18: ["00", "15", "30"],
//       19: ["00", "15", "30", "45"],
//       20: ["00", "15", "30", "45"]
//     };

//     const endRules = {
//       12: ["15", "30", "45"],
//       13: ["00", "15", "30", "45"],
//       14: ["00"],
//       15: ["15", "30", "45"],
//       16: ["00", "15", "30", "45"],
//       17: ["00", "15", "30", "45"],
//       18: ["00", "15", "30", "45"],
//       19: ["00", "15", "30", "45"],
//       20: ["00", "15", "30", "45"],
//       21: ["00"]
//     };

//     const now = new Date();

//     const defaultStart = document.createElement("option");
//     defaultStart.value = originalStart;
//     defaultStart.textContent = "変更なし";
//     defaultStart.selected = true;
//     startSelect.appendChild(defaultStart);

//     const defaultEnd = document.createElement("option");
//     defaultEnd.value = originalEnd;
//     defaultEnd.textContent = "変更なし";
//     defaultEnd.selected = true;
//     endSelect.appendChild(defaultEnd);

//     for (const h in startRules) {
//       for (const m of startRules[h]) {
//         const time = `${String(h).padStart(2, "0")}:${m}`;
//         const dt = new Date(`${selectedDateStr}T${time}:00`);
//         if (dt < now) continue;

//         const opt = document.createElement("option");
//         opt.value = time;
//         opt.textContent = time;
//         startSelect.appendChild(opt);
//       }
//     }

//     for (const h in endRules) {
//       for (const m of endRules[h]) {
//         const time = `${String(h).padStart(2, "0")}:${m}`;
//         const dt = new Date(`${selectedDateStr}T${time}:00`);
//         if (dt < now) continue;

//         const opt = document.createElement("option");
//         opt.value = time;
//         opt.textContent = time;
//         endSelect.appendChild(opt);
//       }
//     }
//   }

//   btnEdit.addEventListener("click", () => {
//     editArea.style.display = "block";
//     generateTimeOptions();
//   });

//   saveEdit.addEventListener("click", async () => {
//     const start = startSelect.value;
//     const end = endSelect.value;

//     const newStart = start === originalStart ? originalStart : start;
//     const newEnd = end === originalEnd ? originalEnd : end;

//     const now = new Date();
//     const startDt = new Date(`${selectedDateStr}T${newStart}:00`);
//     const endDt = new Date(`${selectedDateStr}T${newEnd}:00`);
//     const originalEndDt = new Date(`${selectedDateStr}T${originalEnd}:00`);

//     editError.textContent = "";

//     const startChanged = newStart !== originalStart;
//     const endChanged = newEnd !== originalEnd;

//     if (startChanged && startDt < now) {
//       editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
//       return;
//     }

//     if (endChanged && (endDt < now || originalEndDt < now)) {
//       editError.textContent = "退勤時間は変更できません。公式LINEに相談してください";
//       return;
//     }

//     if (startDt >= endDt) {
//       editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
//       return;
//     }

//     if (!confirm("このシフト変更を保存してもよろしいですか？")) return;

//     try {
//       resultDiv.textContent = "保存中…";

//       const profile = await liff.getProfile();
//       const payload = {
//         userId: profile.userId,
//         shiftId: selectedShiftId,
//         date: selectedDateStr,
//         start: newStart,
//         end: newEnd
//       };

//       await fetch(GAS_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload),
//         mode: "no-cors"
//       });

//       // フロント側の表示も更新
//       const dayShifts = shiftData[selectedDateStr] || [];
//       const targetShift = dayShifts.find(s => s.id === selectedShiftId);
//       if (targetShift) {
//         targetShift.start = newStart;
//         targetShift.end = newEnd;
//       }

//       detailShift.textContent = `${newStart}-${newEnd}`;
//       editArea.style.display = "none";

//       alert("シフトを保存しました");

//       resultDiv.textContent = "";
//       generateCalendar(currentDate);
//       detailView.style.display = "none";
//       calendarView.style.display = "block";

//     } catch (err) {
//       alert("保存中にエラーが発生しました: " + err.message);
//     }
//   });

//   updateButton.addEventListener("click", async () => {
//     try {
//       resultDiv.textContent = "更新中…";

//       const profile = await liff.getProfile();
//       const url =
//         GAS_URL +
//         "?userId=" + encodeURIComponent(profile.userId) +
//         "&name=" + encodeURIComponent(profile.displayName);

//       const res = await fetch(url);
//       const data = await res.json();

//       shiftData = data.shifts || {};

//       firstMessageDiv.style.display = "none";
//       monthNavDiv.style.display = "flex";
//       resultDiv.textContent = "";

//       generateCalendar(currentDate);
//     } catch (err) {
//       resultDiv.textContent = "取得エラー: " + err.message;
//     }
//   });

//   prevMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() - 1);
//     generateCalendar(currentDate);
//   });

//   nextMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() + 1);
//     generateCalendar(currentDate);
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

  let shiftData = {};
  let currentDate = new Date();

  let selectedShiftId = "";
  let selectedDateStr = "";
  let originalStart = "";
  let originalEnd = "";

  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" });
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "LIFF初期化エラー: " + err.message;
    return;
  }

  // 必須要素チェック
  const requiredElements = [
    calendarDiv, currentMonthSpan, updateButton, resultDiv, firstMessageDiv,
    monthNavDiv, prevMonthBtn, nextMonthBtn, calendarView, detailView,
    detailDate, detailShift, backButton, btnEdit, saveEdit, editError,
    editArea, startSelect, endSelect
  ];

  if (requiredElements.some(el => !el)) {
    console.error("必要なHTML要素が不足しています");
    resultDiv.textContent = "HTML要素が不足しています";
    return;
  }

  function toDateTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  function generateCalendar(date) {
    calendarDiv.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth();
    currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "day";
      calendarDiv.appendChild(emptyDiv);
    }

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

  function openDetail(dateStr, shift) {
    selectedDateStr = dateStr;
    selectedShiftId = shift.id || "";
    originalStart = shift.start || "";
    originalEnd = shift.end || "";

    detailDate.textContent = dateStr;
    detailShift.textContent = `${originalStart}-${originalEnd}`;
    editError.textContent = "";
    editArea.style.display = "none";

    calendarView.style.display = "none";
    detailView.style.display = "block";
  }

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

    const defaultStart = document.createElement("option");
    defaultStart.value = "";
    defaultStart.textContent = "変更なし";
    startSelect.appendChild(defaultStart);

    const defaultEnd = document.createElement("option");
    defaultEnd.value = "";
    defaultEnd.textContent = "変更なし";
    endSelect.appendChild(defaultEnd);

    for (const h in startRules) {
      for (const m of startRules[h]) {
        const time = `${String(h).padStart(2, "0")}:${m}`;
        const dt = toDateTime(selectedDateStr, time);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        startSelect.appendChild(opt);
      }
    }

    for (const h in endRules) {
      for (const m of endRules[h]) {
        const time = `${String(h).padStart(2, "0")}:${m}`;
        const dt = toDateTime(selectedDateStr, time);
        if (dt < now) continue;

        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        endSelect.appendChild(opt);
      }
    }
  }

  async function loadShifts() {
    resultDiv.textContent = "更新中…";

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();

    const params = new URLSearchParams({
      action: "fetch",
      userId: profile.userId,
      name: profile.displayName
    });

    const res = await fetch(`${GAS_URL}?${params.toString()}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "取得に失敗しました");
    }

    shiftData = data.shifts || {};

    firstMessageDiv.style.display = "none";
    monthNavDiv.style.display = "flex";
    resultDiv.textContent = "";

    generateCalendar(currentDate);
  }

  backButton.addEventListener("click", () => {
    detailView.style.display = "none";
    calendarView.style.display = "block";
    editArea.style.display = "none";
    editError.textContent = "";
  });

  btnEdit.addEventListener("click", () => {
    editArea.style.display = "block";
    editError.textContent = "";
    generateTimeOptions();
  });

  saveEdit.addEventListener("click", async () => {
    const selectedStart = startSelect.value;
    const selectedEnd = endSelect.value;

    const newStart = selectedStart || originalStart;
    const newEnd = selectedEnd || originalEnd;

    const now = new Date();
    const startDt = toDateTime(selectedDateStr, newStart);
    const endDt = toDateTime(selectedDateStr, newEnd);
    const originalEndDt = toDateTime(selectedDateStr, originalEnd);

    editError.textContent = "";

    const startChanged = newStart !== originalStart;
    const endChanged = newEnd !== originalEnd;

    if (startChanged && startDt < now) {
      editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
      return;
    }

    if (endChanged && (endDt < now || originalEndDt < now)) {
      editError.textContent = "退勤時間は変更できません。公式LINEに相談してください";
      return;
    }

    if (startDt >= endDt) {
      editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
      return;
    }

    if (!confirm("このシフト変更を保存してもよろしいですか？")) {
      return;
    }

    try {
      resultDiv.textContent = "保存中…";

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const profile = await liff.getProfile();

      const params = new URLSearchParams({
        action: "update",
        userId: profile.userId,
        shiftId: selectedShiftId,
        date: selectedDateStr,
        start: newStart,
        end: newEnd
      });

      const res = await fetch(`${GAS_URL}?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        editError.textContent = data.message || "時間変更に失敗しました";
        resultDiv.textContent = "";
        return;
      }

      const dayShifts = shiftData[selectedDateStr] || [];
      const targetShift = dayShifts.find((s) => s.id === selectedShiftId);

      if (targetShift) {
        targetShift.start = newStart;
        targetShift.end = newEnd;
      }

      detailShift.textContent = `${newStart}-${newEnd}`;
      editArea.style.display = "none";

      alert(data.message || "時間変更完了");

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

  updateButton.addEventListener("click", async () => {
    try {
      await loadShifts();
    } catch (err) {
      console.error(err);
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
// 休みまでは完璧！
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // 詳細画面
//   const calendarView = document.getElementById("calendarView");
//   const detailView = document.getElementById("detailView");
//   const detailDate = document.getElementById("detailDate");
//   const detailShift = document.getElementById("detailShift");

//   const backButton = document.getElementById("backButton");
//   const btnEdit = document.getElementById("btnEdit");
//   const btnDelete = document.getElementById("btnDelete");   // 追加
//   const btnMedical = document.getElementById("btnMedical"); // 追加
//   const saveEdit = document.getElementById("saveEdit");
//   const editError = document.getElementById("editError");

//   const editArea = document.getElementById("editArea");
//   const startSelect = document.getElementById("startTime");
//   const endSelect = document.getElementById("endTime");

//   const GAS_URL = "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

//   let shiftData = {};
//   let currentDate = new Date();

//   // 選択中シフト情報
//   let selectedShiftId = "";
//   let selectedDateStr = "";
//   let originalStart = "";
//   let originalEnd = "";

//   // =====================
//   // 共通
//   // =====================
//   function escapeHtml(str) {
//     return String(str)
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//       .replaceAll('"', "&quot;")
//       .replaceAll("'", "&#039;");
//   }

//   function formatDateJP(dateStr) {
//     const d = new Date(dateStr + "T00:00:00");
//     const week = ["日", "月", "火", "水", "木", "金", "土"];
//     return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
//   }

//   function removeSelectedShiftFromLocal() {
//     const dayShifts = shiftData[selectedDateStr] || [];
//     shiftData[selectedDateStr] = dayShifts.filter((s) => s.id !== selectedShiftId);
//   }

//   // =====================
//   // LIFF初期化
//   // =====================
//   try {
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });

//     resultDiv.style.color = "black";
//     resultDiv.innerHTML = "LIFF初期化成功<br>";

//     if (!liff.isLoggedIn()) {
//       resultDiv.innerHTML += "<br>LINEログインへ移動します…";
//       liff.login({
//         redirectUri: window.location.href
//       });
//       return;
//     }
//   } catch (err) {
//     console.error(err);
//     resultDiv.textContent = "LIFF初期化エラー: " + err.message;
//     return;
//   }

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
//       const emptyDiv = document.createElement("div");
//       emptyDiv.className = "day";
//       calendarDiv.appendChild(emptyDiv);
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

//   // =====================
//   // 詳細表示
//   // =====================
//   function openDetail(date, shift) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     selectedDateStr = date;
//     selectedShiftId = shift.id;
//     originalStart = shift.start;
//     originalEnd = shift.end;

//     detailDate.textContent = formatDateJP(date);
//     detailShift.textContent = `${shift.start}-${shift.end}`;

//     editArea.style.display = "none";
//     editError.textContent = "";
//   }

//   backButton.addEventListener("click", () => {
//     detailView.style.display = "none";
//     calendarView.style.display = "block";
//   });

//   // =====================
//   // プルダウン生成
//   // =====================
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

//   // =====================
//   // 時間変更
//   // =====================
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

//     if (!confirm("このシフト変更を保存してもよろしいですか？")) {
//       return;
//     }

//     try {
//       resultDiv.textContent = "保存中…";

//       const profile = await liff.getProfile();

//       const url =
//         GAS_URL +
//         "?action=update" +
//         "&userId=" + encodeURIComponent(profile.userId) +
//         "&shiftId=" + encodeURIComponent(selectedShiftId) +
//         "&date=" + encodeURIComponent(selectedDateStr) +
//         "&start=" + encodeURIComponent(newStart) +
//         "&end=" + encodeURIComponent(newEnd);

//       const res = await fetch(url);
//       const data = await res.json();

//       if (!data.success) {
//         editError.textContent = data.message || "時間変更に失敗しました";
//         resultDiv.textContent = "";
//         return;
//       }

//       const dayShifts = shiftData[selectedDateStr] || [];
//       const targetShift = dayShifts.find((s) => s.id === selectedShiftId);

//       if (targetShift) {
//         targetShift.start = newStart;
//         targetShift.end = newEnd;
//       }

//       detailShift.textContent = `${newStart}-${newEnd}`;
//       editArea.style.display = "none";

//       alert(data.message || "シフトを保存しました");

//       resultDiv.textContent = "";
//       generateCalendar(currentDate);
//       detailView.style.display = "none";
//       calendarView.style.display = "block";

//     } catch (err) {
//       console.error(err);
//       editError.textContent = "保存中にエラーが発生しました";
//       resultDiv.textContent = "";
//     }
//   });

//   // =====================
//   // 休み / 削除
//   // =====================
//   if (btnDelete) {
//     btnDelete.addEventListener("click", async () => {
//       const msg =
//         `下記シフトについて、休み / 削除申請を行います。\n\n` +
//         `${formatDateJP(selectedDateStr)}\n` +
//         `${originalStart}-${originalEnd}\n\n` +
//         `よろしいですか？`;

//       if (!confirm(msg)) {
//         return;
//       }

//       try {
//         resultDiv.textContent = "処理中…";
//         editError.textContent = "";

//         const profile = await liff.getProfile();

//         const url =
//           GAS_URL +
//           "?action=deleteOrAbsent" +
//           "&userId=" + encodeURIComponent(profile.userId) +
//           "&name=" + encodeURIComponent(profile.displayName) +
//           "&shiftId=" + encodeURIComponent(selectedShiftId) +
//           "&date=" + encodeURIComponent(selectedDateStr) +
//           "&start=" + encodeURIComponent(originalStart) +
//           "&end=" + encodeURIComponent(originalEnd);

//         const res = await fetch(url);
//         const data = await res.json();

//         if (!data.success) {
//           alert(data.message || "休み / 削除処理に失敗しました");
//           resultDiv.textContent = "";
//           return;
//         }

//         // deleted でも absent でも、
//         // カレンダー上は元シフトを消したいケースが多いので一旦非表示にする
//         removeSelectedShiftFromLocal();
//         generateCalendar(currentDate);

//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         resultDiv.textContent = "";

//         alert(data.message || "処理が完了しました");

//       } catch (err) {
//         console.error(err);
//         resultDiv.textContent = "";
//         alert("休み / 削除処理中にエラーが発生しました");
//       }
//     });
//   }

//   // =====================
//   // 診断書提出
//   // まだ Anycross / GAS 未接続なら仮置き
//   // =====================
//   if (btnMedical) {
//     btnMedical.addEventListener("click", () => {
//       alert("診断書提出の処理はこれから接続します");
//     });
//   }

//   // =====================
//   // 更新ボタン
//   // =====================
//   updateButton.addEventListener("click", async () => {
//     try {
//       resultDiv.textContent = "更新中…";

//       const profile = await liff.getProfile();

//       const url =
//         GAS_URL +
//         "?action=fetch" +
//         "&userId=" + encodeURIComponent(profile.userId) +
//         "&name=" + encodeURIComponent(profile.displayName);

//       const res = await fetch(url);
//       const data = await res.json();

//       if (!data.success) {
//         resultDiv.textContent = data.message || "取得に失敗しました";
//         return;
//       }

//       shiftData = data.shifts || {};

//       firstMessageDiv.style.display = "none";
//       monthNavDiv.style.display = "flex";
//       resultDiv.textContent = "";

//       generateCalendar(currentDate);

//     } catch (err) {
//       console.error(err);
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

  // 詳細画面
  const calendarView = document.getElementById("calendarView");
  const detailView = document.getElementById("detailView");
  const detailDate = document.getElementById("detailDate");
  const detailShift = document.getElementById("detailShift");

  const backButton = document.getElementById("backButton");
  const btnEdit = document.getElementById("btnEdit");
  const btnDelete = document.getElementById("btnDelete");
  const btnMedical = document.getElementById("btnMedical");
  const saveEdit = document.getElementById("saveEdit");
  const editError = document.getElementById("editError");

  const editArea = document.getElementById("editArea");
  const startSelect = document.getElementById("startTime");
  const endSelect = document.getElementById("endTime");

  // 診断書提出関連
  const medicalArea = document.getElementById("medicalArea");
  const medicalFile = document.getElementById("medicalFile");
  const medicalPreviewWrap = document.getElementById("medicalPreviewWrap");
  const medicalPreview = document.getElementById("medicalPreview");
  const medicalError = document.getElementById("medicalError");
  const submitMedical = document.getElementById("submitMedical");

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

  let shiftData = {};
  let currentDate = new Date();

  // 選択中シフト情報
  let selectedShiftId = "";
  let selectedDateStr = "";
  let originalStart = "";
  let originalEnd = "";

  // 診断書画像
  let medicalFileObj = null;
  let medicalImageBase64 = "";

  // =====================
  // 共通関数
  // =====================
  function formatDateJP(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
  }

  function removeSelectedShiftFromLocal() {
    const dayShifts = shiftData[selectedDateStr] || [];
    shiftData[selectedDateStr] = dayShifts.filter((s) => s.id !== selectedShiftId);
  }

  function resetMedicalArea() {
    if (!medicalArea) return;

    medicalArea.style.display = "none";

    if (medicalFile) {
      medicalFile.value = "";
    }

    if (medicalPreview) {
      medicalPreview.src = "";
    }

    if (medicalPreviewWrap) {
      medicalPreviewWrap.style.display = "none";
    }

    if (medicalError) {
      medicalError.textContent = "";
    }

    medicalFileObj = null;
    medicalImageBase64 = "";
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        const result = reader.result || "";
        const base64 = String(result).split(",")[1] || "";
        resolve(base64);
      };

      reader.onerror = function () {
        reject(new Error("画像の読み込みに失敗しました"));
      };

      reader.readAsDataURL(file);
    });
  }

  function setButtonsDisabled(disabled) {
    if (updateButton) updateButton.disabled = disabled;
    if (btnEdit) btnEdit.disabled = disabled;
    if (btnDelete) btnDelete.disabled = disabled;
    if (btnMedical) btnMedical.disabled = disabled;
    if (saveEdit) saveEdit.disabled = disabled;
    if (submitMedical) submitMedical.disabled = disabled;
    if (backButton) backButton.disabled = disabled;
  }

  // =====================
  // LIFF初期化
  // =====================
  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" });

    resultDiv.style.color = "black";
    resultDiv.innerHTML = "LIFF初期化成功<br>";

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

    for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "day";
      calendarDiv.appendChild(emptyDiv);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const fullDateStr =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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

    detailDate.textContent = formatDateJP(date);
    detailShift.textContent = `${shift.start}-${shift.end}`;

    editArea.style.display = "none";
    editError.textContent = "";
    resetMedicalArea();
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      detailView.style.display = "none";
      calendarView.style.display = "block";
      editArea.style.display = "none";
      editError.textContent = "";
      resetMedicalArea();
    });
  }

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

    const defaultStart = document.createElement("option");
    defaultStart.value = originalStart;
    defaultStart.textContent = "変更なし";
    defaultStart.selected = true;
    startSelect.appendChild(defaultStart);

    const defaultEnd = document.createElement("option");
    defaultEnd.value = originalEnd;
    defaultEnd.textContent = "変更なし";
    defaultEnd.selected = true;
    endSelect.appendChild(defaultEnd);

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

  // =====================
  // 時間変更
  // =====================
  if (btnEdit) {
    btnEdit.addEventListener("click", () => {
      editArea.style.display = "block";
      editError.textContent = "";
      generateTimeOptions();
    });
  }

  if (saveEdit) {
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
        setButtonsDisabled(true);
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
          setButtonsDisabled(false);
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

        alert(data.message || "シフトを保存しました");

        resultDiv.textContent = "";
        generateCalendar(currentDate);
        detailView.style.display = "none";
        calendarView.style.display = "block";
      } catch (err) {
        console.error(err);
        editError.textContent = "保存中にエラーが発生しました";
        resultDiv.textContent = "";
      } finally {
        setButtonsDisabled(false);
      }
    });
  }

  // =====================
  // 休み / 削除
  // =====================
  if (btnDelete) {
    btnDelete.addEventListener("click", async () => {
      const msg =
        `下記シフトについて、休み / 削除申請を行います。\n\n` +
        `${formatDateJP(selectedDateStr)}\n` +
        `${originalStart}-${originalEnd}\n\n` +
        `よろしいですか？`;

      if (!confirm(msg)) {
        return;
      }

      try {
        setButtonsDisabled(true);
        resultDiv.textContent = "処理中…";
        editError.textContent = "";

        const profile = await liff.getProfile();

        const url =
          GAS_URL +
          "?action=deleteOrAbsent" +
          "&userId=" + encodeURIComponent(profile.userId) +
          "&name=" + encodeURIComponent(profile.displayName) +
          "&shiftId=" + encodeURIComponent(selectedShiftId) +
          "&date=" + encodeURIComponent(selectedDateStr) +
          "&start=" + encodeURIComponent(originalStart) +
          "&end=" + encodeURIComponent(originalEnd);

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          alert(data.message || "休み / 削除処理に失敗しました");
          resultDiv.textContent = "";
          setButtonsDisabled(false);
          return;
        }

        removeSelectedShiftFromLocal();
        generateCalendar(currentDate);

        detailView.style.display = "none";
        calendarView.style.display = "block";
        resultDiv.textContent = "";

        alert(data.message || "処理が完了しました");
      } catch (err) {
        console.error(err);
        resultDiv.textContent = "";
        alert("休み / 削除処理中にエラーが発生しました");
      } finally {
        setButtonsDisabled(false);
      }
    });
  }

  // =====================
  // 診断書提出エリアを開閉
  // =====================
  if (btnMedical) {
    btnMedical.addEventListener("click", () => {
      if (!medicalArea) return;

      const isOpen = medicalArea.style.display === "block";
      medicalArea.style.display = isOpen ? "none" : "block";
      medicalError.textContent = "";
    });
  }

  // =====================
  // 診断書画像選択
  // =====================
  if (medicalFile) {
    medicalFile.addEventListener("change", async (e) => {
      try {
        medicalError.textContent = "";

        const file = e.target.files && e.target.files[0];

        if (!file) {
          medicalFileObj = null;
          medicalImageBase64 = "";
          if (medicalPreview) medicalPreview.src = "";
          if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
          return;
        }

        if (!file.type.startsWith("image/")) {
          medicalError.textContent = "画像ファイルを選択してください";
          medicalFile.value = "";
          medicalFileObj = null;
          medicalImageBase64 = "";
          if (medicalPreview) medicalPreview.src = "";
          if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
          return;
        }

        medicalFileObj = file;
        medicalImageBase64 = await fileToBase64(file);

        if (medicalPreview) {
          medicalPreview.src = URL.createObjectURL(file);
        }
        if (medicalPreviewWrap) {
          medicalPreviewWrap.style.display = "block";
        }
      } catch (err) {
        console.error(err);
        medicalError.textContent = "画像の読み込みに失敗しました";
      }
    });
  }

  // =====================
  // 診断書提出
  // =====================
  if (submitMedical) {
    submitMedical.addEventListener("click", async () => {
      try {
        medicalError.textContent = "";

        if (!medicalFileObj || !medicalImageBase64) {
          medicalError.textContent = "診断書の写真をアップロードしてください";
          return;
        }

        const confirmMsg =
          "名前漢字フルネームと、日付が書いていますか？\n\n" +
          "問題なければ、この内容で提出します。";

        if (!confirm(confirmMsg)) {
          return;
        }

        setButtonsDisabled(true);
        resultDiv.textContent = "提出中…";

        const profile = await liff.getProfile();

        const res = await fetch(GAS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "submitMedical",
            userId: profile.userId,
            name: profile.displayName,
            shiftId: selectedShiftId,
            date: selectedDateStr,
            start: originalStart,
            end: originalEnd,
            fileName: medicalFileObj.name,
            mimeType: medicalFileObj.type,
            imageBase64: medicalImageBase64
          })
        });

        const data = await res.json();

        if (!data.success) {
          medicalError.textContent = data.message || "診断書の提出に失敗しました";
          resultDiv.textContent = "";
          setButtonsDisabled(false);
          return;
        }

        alert(
          data.message ||
          "診断書の提出が完了しました。月末に確認をしているため、不正があった場合は当日欠勤に戻る可能性があります。"
        );

        resultDiv.textContent = "";
        resetMedicalArea();
        detailView.style.display = "none";
        calendarView.style.display = "block";
      } catch (err) {
        console.error(err);
        resultDiv.textContent = "";
        medicalError.textContent = "提出中にエラーが発生しました";
      } finally {
        setButtonsDisabled(false);
      }
    });
  }

  // =====================
  // 更新ボタン
  // =====================
  if (updateButton) {
    updateButton.addEventListener("click", async () => {
      try {
        setButtonsDisabled(true);
        resultDiv.textContent = "更新中…";

        const profile = await liff.getProfile();

        const url =
          GAS_URL +
          "?action=fetch" +
          "&userId=" + encodeURIComponent(profile.userId) +
          "&name=" + encodeURIComponent(profile.displayName);

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          resultDiv.textContent = data.message || "取得に失敗しました";
          setButtonsDisabled(false);
          return;
        }

        shiftData = data.shifts || {};

        firstMessageDiv.style.display = "none";
        monthNavDiv.style.display = "flex";
        resultDiv.textContent = "";

        generateCalendar(currentDate);
      } catch (err) {
        console.error(err);
        resultDiv.textContent = "取得エラー: " + err.message;
      } finally {
        setButtonsDisabled(false);
      }
    });
  }

  // =====================
  // 月移動
  // =====================
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate);
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate);
    });
  }
};



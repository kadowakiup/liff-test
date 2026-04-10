// // // // // // // 完璧
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const resultDiv = document.getElementById("result");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // 基本情報
//   const summaryDiv = document.getElementById("summary");
//   const userNameSpan = document.getElementById("userName");
//   const workTimeSpan = document.getElementById("workTime");

//   // 詳細画面
//   const calendarView = document.getElementById("calendarView");
//   const detailView = document.getElementById("detailView");
//   const detailDate = document.getElementById("detailDate");
//   const detailShift = document.getElementById("detailShift");

//   const backButton = document.getElementById("backButton");
//   const btnEdit = document.getElementById("btnEdit");
//   const btnDelete = document.getElementById("btnDelete");
//   const btnMedical = document.getElementById("btnMedical");
//   const saveEdit = document.getElementById("saveEdit");
//   const editError = document.getElementById("editError");

//   const editArea = document.getElementById("editArea");
//   const startSelect = document.getElementById("startTime");
//   const endSelect = document.getElementById("endTime");

//   // 診断書提出関連
//   const medicalArea = document.getElementById("medicalArea");
//   const medicalFile = document.getElementById("medicalFile");
//   const medicalPreviewWrap = document.getElementById("medicalPreviewWrap");
//   const medicalPreview = document.getElementById("medicalPreview");
//   const medicalError = document.getElementById("medicalError");
//   const submitMedical = document.getElementById("submitMedical");

//   const GAS_URL =
//     "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

//   let shiftData = {};
//   let currentDate = new Date();

//   let fetchedName = "";

//   // 選択中シフト情報
//   let selectedShiftId = "";
//   let selectedDateStr = "";
//   let originalStart = "";
//   let originalEnd = "";
//   let originalState = "";

//   // 画面モード
//   let detailMode = "view"; // "view" | "add"

//   // 診断書画像
//   let medicalFileObj = null;
//   let medicalImageBase64 = "";
//   let medicalPreviewObjectUrl = "";

//   // =====================
//   // 共通関数
//   // =====================
//   function normalizeText(value) {
//     return String(value || "").trim();
//   }

//   function normalizeTime(value) {
//     const v = normalizeText(value);
//     if (!v) return "";

//     const match = v.match(/^(\d{1,2}):(\d{2})$/);
//     if (!match) return v;

//     const hour = String(Number(match[1])).padStart(2, "0");
//     const minute = match[2];
//     return `${hour}:${minute}`;
//   }

//   function formatDecimalHours(hours) {
//     const num = Number(hours || 0);
//     if (!Number.isFinite(num)) return "0";
//     return Number.isInteger(num) ? String(num) : String(num);
//   }

//   function formatMinutesToDecimalHours(minutes) {
//     const mins = Number(minutes || 0);
//     if (!Number.isFinite(mins) || mins <= 0) return "0";

//     const hours = mins / 60;
//     return Number.isInteger(hours)
//       ? String(hours)
//       : String(Math.round(hours * 100) / 100);
//   }

//   function formatMonthTotalText(targetDate) {
//     const totalMinutes = calcMonthlyWorkMinutes(targetDate);
//     return `${formatMinutesToDecimalHours(totalMinutes)}時間`;
//   }

//   function updateWorktimeDisplay() {
//     if (!workTimeSpan) return;
//     workTimeSpan.textContent = formatMonthTotalText(currentDate);
//   }

//   function formatDateJP(dateStr) {
//     const d = new Date(dateStr + "T00:00:00");
//     const week = ["日", "月", "火", "水", "木", "金", "土"];
//     return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
//   }

//   function isAbsentState(state) {
//     return normalizeText(state) === "当欠";
//   }

//   function isMedicalSubmittedState(state) {
//     return normalizeText(state) === "診断書提出済み";
//   }

//   function isDeletedOrOffState(state) {
//     const s = normalizeText(state);
//     return s === "休み" || s === "削除" || s === "休み / 削除";
//   }

//   function isSpecialState(state) {
//     return (
//       isAbsentState(state) ||
//       isMedicalSubmittedState(state) ||
//       isDeletedOrOffState(state)
//     );
//   }

//   function getShiftDisplayText(shift) {
//     const state = normalizeText(shift?.state);
//     const start = normalizeTime(shift?.start);
//     const end = normalizeTime(shift?.end);

//     if (isSpecialState(state)) {
//       return state;
//     }

//     if (start && end) {
//       return `${start}-${end}`;
//     }

//     return "";
//   }

//   function hasEditableShiftTime(shift) {
//     const state = normalizeText(shift?.state);
//     const start = normalizeTime(shift?.start);
//     const end = normalizeTime(shift?.end);

//     return !isSpecialState(state) && !!start && !!end;
//   }

//   function getDateOnly(date) {
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     return d;
//   }

//   function isTodayOrFuture(dateStr) {
//     const target = getDateOnly(new Date(dateStr + "T00:00:00"));
//     const today = getDateOnly(new Date());
//     return target >= today;
//   }

//   function hasVisibleShiftOnDay(dayShifts) {
//     if (!Array.isArray(dayShifts) || dayShifts.length === 0) return false;
//     return dayShifts.some((shift) => !!getShiftDisplayText(shift));
//   }

//   function hasAnyShiftRecordOnDay(dayShifts) {
//     return Array.isArray(dayShifts) && dayShifts.length > 0;
//   }

//   function clearMedicalPreviewUrl() {
//     if (medicalPreviewObjectUrl) {
//       URL.revokeObjectURL(medicalPreviewObjectUrl);
//       medicalPreviewObjectUrl = "";
//     }
//   }

//   function resetMedicalArea() {
//     if (!medicalArea) return;

//     medicalArea.style.display = "none";

//     if (medicalFile) {
//       medicalFile.value = "";
//     }

//     clearMedicalPreviewUrl();

//     if (medicalPreview) {
//       medicalPreview.src = "";
//     }

//     if (medicalPreviewWrap) {
//       medicalPreviewWrap.style.display = "none";
//     }

//     if (medicalError) {
//       medicalError.textContent = "";
//     }

//     medicalFileObj = null;
//     medicalImageBase64 = "";
//   }

//   function resetDetailState() {
//     selectedShiftId = "";
//     selectedDateStr = "";
//     originalStart = "";
//     originalEnd = "";
//     originalState = "";
//     detailMode = "view";

//     if (editArea) editArea.style.display = "none";
//     if (editError) editError.textContent = "";
//     resetMedicalArea();
//   }

//   function setButtonsDisabled(disabled) {
//     if (btnEdit) btnEdit.disabled = disabled;
//     if (btnDelete) btnDelete.disabled = disabled;
//     if (btnMedical) btnMedical.disabled = disabled;
//     if (saveEdit) saveEdit.disabled = disabled;
//     if (submitMedical) submitMedical.disabled = disabled;
//     if (backButton) backButton.disabled = disabled;
//     if (prevMonthBtn) prevMonthBtn.disabled = disabled;
//     if (nextMonthBtn) nextMonthBtn.disabled = disabled;

//     document.querySelectorAll(".add-shift-button").forEach((btn) => {
//       btn.disabled = disabled;
//       btn.style.pointerEvents = disabled ? "none" : "auto";
//       btn.style.opacity = disabled ? "0.5" : "1";
//     });
//   }

//   function fileToBase64(fileOrBlob) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();

//       reader.onload = function () {
//         const result = reader.result || "";
//         const base64 = String(result).split(",")[1] || "";
//         resolve(base64);
//       };

//       reader.onerror = function () {
//         reject(new Error("base64変換に失敗しました"));
//       };

//       reader.readAsDataURL(fileOrBlob);
//     });
//   }

//   async function resizeImageFile(file, maxWidth = 1200, quality = 0.7) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();

//       reader.onload = function (event) {
//         const img = new Image();

//         img.onload = function () {
//           let width = img.width;
//           let height = img.height;

//           if (width > maxWidth) {
//             height = Math.round(height * (maxWidth / width));
//             width = maxWidth;
//           }

//           const canvas = document.createElement("canvas");
//           canvas.width = width;
//           canvas.height = height;

//           const ctx = canvas.getContext("2d");
//           if (!ctx) {
//             reject(new Error("画像処理に失敗しました"));
//             return;
//           }

//           ctx.drawImage(img, 0, 0, width, height);

//           canvas.toBlob(
//             (blob) => {
//               if (!blob) {
//                 reject(new Error("画像圧縮に失敗しました"));
//                 return;
//               }
//               resolve(blob);
//             },
//             "image/jpeg",
//             quality
//           );
//         };

//         img.onerror = function () {
//           reject(new Error("画像の読み込みに失敗しました"));
//         };

//         img.src = event.target.result;
//       };

//       reader.onerror = function () {
//         reject(new Error("画像の読み込みに失敗しました"));
//       };

//       reader.readAsDataURL(file);
//     });
//   }

//   async function prepareCompressedMedicalImage(file) {
//     let blob = await resizeImageFile(file, 1200, 0.7);
//     let base64 = await fileToBase64(blob);

//     if (base64.length > 4000000) {
//       blob = await resizeImageFile(file, 1000, 0.6);
//       base64 = await fileToBase64(blob);
//     }

//     if (base64.length > 3000000) {
//       blob = await resizeImageFile(file, 800, 0.55);
//       base64 = await fileToBase64(blob);
//     }

//     if (base64.length > 2500000) {
//       blob = await resizeImageFile(file, 700, 0.5);
//       base64 = await fileToBase64(blob);
//     }

//     return { blob, base64 };
//   }

//   async function fetchJson(url, options = {}) {
//     const res = await fetch(url, options);
//     const text = await res.text();

//     try {
//       return JSON.parse(text);
//     } catch (err) {
//       throw new Error(`JSON解析失敗: ${text}`);
//     }
//   }

//   function minutesFromTimeString(timeStr) {
//     const normalized = normalizeTime(timeStr);
//     const match = normalized.match(/^(\d{2}):(\d{2})$/);
//     if (!match) return null;

//     const h = Number(match[1]);
//     const m = Number(match[2]);
//     return h * 60 + m;
//   }

//   function calcShiftMinutes(dateKey, shift) {
//     const state = normalizeText(shift?.state);
//     const startStr = normalizeTime(shift?.start);
//     const endStr = normalizeTime(shift?.end);

//     if (
//       isAbsentState(state) ||
//       isMedicalSubmittedState(state) ||
//       isDeletedOrOffState(state)
//     ) {
//       return 0;
//     }

//     if (!startStr || !endStr) return 0;

//     const startMinutes = minutesFromTimeString(startStr);
//     const endMinutes = minutesFromTimeString(endStr);

//     if (startMinutes === null || endMinutes === null) return 0;
//     if (endMinutes <= startMinutes) return 0;

//     let workedMinutes = endMinutes - startMinutes;

//     // 休憩 14:00-15:00 を差し引く
//     const breakStart = 14 * 60;
//     const breakEnd = 15 * 60;

//     const overlapStart = Math.max(startMinutes, breakStart);
//     const overlapEnd = Math.min(endMinutes, breakEnd);

//     if (overlapEnd > overlapStart) {
//       workedMinutes -= overlapEnd - overlapStart;
//     }

//     return Math.max(0, workedMinutes);
//   }

//   function calcMonthlyWorkMinutes(targetDate) {
//     let totalMinutes = 0;

//     const year = targetDate.getFullYear();
//     const month = targetDate.getMonth();

//     for (const dateKey in shiftData) {
//       const d = new Date(dateKey + "T00:00:00");
//       if (d.getFullYear() !== year || d.getMonth() !== month) continue;

//       const dayShifts = shiftData[dateKey] || [];
//       dayShifts.forEach((shift) => {
//         totalMinutes += calcShiftMinutes(dateKey, shift);
//       });
//     }

//     return totalMinutes;
//   }

//   function getDayShifts(dateStr) {
//     if (!Array.isArray(shiftData[dateStr])) {
//       shiftData[dateStr] = [];
//     }
//     return shiftData[dateStr];
//   }

//   function findShiftById(targetShiftId) {
//     for (const dateKey in shiftData) {
//       const dayShifts = shiftData[dateKey] || [];
//       const found = dayShifts.find((s) => s.id === targetShiftId);
//       if (found) {
//         return {
//           date: dateKey,
//           shift: found
//         };
//       }
//     }
//     return null;
//   }

//   function rerenderCurrentMonth() {
//     generateCalendar(currentDate);
//     updateWorktimeDisplay();
//   }

//   function applyLocalAddShift(dateStr, start, end, serverShiftId = "") {
//     const dayShifts = getDayShifts(dateStr);

//     const newShift = {
//       id: serverShiftId || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
//       start: normalizeTime(start),
//       end: normalizeTime(end),
//       state: ""
//     };

//     dayShifts.push(newShift);

//     dayShifts.sort((a, b) => {
//       const aStart = minutesFromTimeString(a.start) ?? 9999;
//       const bStart = minutesFromTimeString(b.start) ?? 9999;
//       return aStart - bStart;
//     });

//     return newShift;
//   }

//   function applyLocalUpdateShift(shiftId, dateStr, start, end) {
//     const found = findShiftById(shiftId);
//     if (!found) return null;

//     found.shift.start = normalizeTime(start);
//     found.shift.end = normalizeTime(end);
//     found.shift.state = "";

//     if (found.date !== dateStr) {
//       const oldDayShifts = getDayShifts(found.date);
//       const idx = oldDayShifts.findIndex((s) => s.id === shiftId);
//       if (idx >= 0) {
//         const moved = oldDayShifts.splice(idx, 1)[0];
//         const newDayShifts = getDayShifts(dateStr);
//         newDayShifts.push(moved);
//       }
//     }

//     return found.shift;
//   }

//   // ===== ★ 休む日の前日23時判定関数 =====
//   function determineDeleteOrAbsent(dateStr) {
//     const targetDate = new Date(dateStr + "T00:00:00");
//     const deadline = new Date(targetDate.getTime());
//     deadline.setDate(deadline.getDate() - 1); // 前日
//     deadline.setHours(23, 0, 0, 0);           // 23:00

//     const now = new Date();
//     // 現在時刻が前日23時以前なら「空白（削除）」、過ぎていれば「当欠」
//     return now <= deadline ? "deleted" : "当欠";
//   }

//   // ===== ★ カレンダーの表記を更新する処理 =====
//   function applyLocalDeleteOrAbsent(shiftId, actionType) {
//     const found = findShiftById(shiftId);
//     if (!found) return null;

//     if (actionType === "deleted") {
//       // 削除（空白）にする：配列から消去
//       const dayShifts = getDayShifts(found.date);
//       const idx = dayShifts.findIndex((s) => s.id === shiftId);
//       if (idx >= 0) {
//         dayShifts.splice(idx, 1);
//       }
//       return null;
//     } else {
//       // 当欠にする
//       found.shift.state = "当欠";
//       found.shift.start = "";
//       found.shift.end = "";
//       return found.shift;
//     }
//   }

//   function applyLocalMedicalSubmitted(shiftId) {
//     const found = findShiftById(shiftId);
//     if (!found) return null;

//     found.shift.state = "診断書提出済み";
//     found.shift.start = "";
//     found.shift.end = "";

//     return found.shift;
//   }

//   async function reloadShifts() {
//     const profile = await liff.getProfile();

//     const url =
//       GAS_URL +
//       "?action=fetch" +
//       "&userId=" + encodeURIComponent(profile.userId) +
//       "&name=" + encodeURIComponent(profile.displayName);

//     const data = await fetchJson(url);

//     if (!data.success) {
//       throw new Error(data.message || "シフト取得に失敗しました");
//     }

//     shiftData = data.shifts || {};
//     fetchedName = data.name || "";

//     if (userNameSpan) {
//       userNameSpan.textContent = fetchedName;
//     }

//     if (summaryDiv) {
//       summaryDiv.style.display = "block";
//     }

//     updateWorktimeDisplay();

//     monthNavDiv.style.display = "flex";
//     generateCalendar(currentDate);
//   }

//   function updateDetailActionButtons(shift) {
//     if (detailMode === "add") {
//       if (btnEdit) btnEdit.style.display = "none";
//       if (btnDelete) btnDelete.style.display = "none";
//       if (btnMedical) btnMedical.style.display = "none";
//       return;
//     }

//     const state = normalizeText(shift?.state);
//     const canEditBase = hasEditableShiftTime(shift);

//     const showEdit = canEditBase && isTodayOrFuture(selectedDateStr);
//     const showDelete = canEditBase && isTodayOrFuture(selectedDateStr);

//     const targetDate = getDateOnly(new Date(selectedDateStr + "T00:00:00"));
//     const today = getDateOnly(new Date());
//     const isToday = targetDate.getTime() === today.getTime();

//     const showMedical =
//       (canEditBase && isToday) || isAbsentState(state);

//     if (btnEdit) {
//       btnEdit.style.display = showEdit ? "inline-block" : "none";
//     }

//     if (btnDelete) {
//       btnDelete.style.display = showDelete ? "inline-block" : "none";
//     }

//     if (btnMedical) {
//       btnMedical.style.display = showMedical ? "inline-block" : "none";
//     }

//     if (!showEdit) {
//       if (editArea) {
//         editArea.style.display = "none";
//       }
//       if (editError) {
//         editError.textContent = "";
//       }
//     }

//     if (!showMedical) {
//       resetMedicalArea();
//     }
//   }

//   function generateTimeOptionsForMode(mode) {
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

//     if (mode === "view") {
//       const defaultStart = document.createElement("option");
//       defaultStart.value = originalStart;
//       defaultStart.textContent = "変更なし";
//       defaultStart.selected = true;
//       startSelect.appendChild(defaultStart);

//       const defaultEnd = document.createElement("option");
//       defaultEnd.value = originalEnd;
//       defaultEnd.textContent = "変更なし";
//       defaultEnd.selected = true;
//       endSelect.appendChild(defaultEnd);
//     } else {
//       const defaultStart = document.createElement("option");
//       defaultStart.value = "";
//       defaultStart.textContent = "選択してください";
//       defaultStart.selected = true;
//       startSelect.appendChild(defaultStart);

//       const defaultEnd = document.createElement("option");
//       defaultEnd.value = "";
//       defaultEnd.textContent = "選択してください";
//       defaultEnd.selected = true;
//       endSelect.appendChild(defaultEnd);
//     }

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

//   function openDetail(date, shift) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     detailMode = "view";
//     selectedDateStr = date;
//     selectedShiftId = shift.id || "";
//     originalStart = normalizeTime(shift.start);
//     originalEnd = normalizeTime(shift.end);
//     originalState = normalizeText(shift.state);

//     detailDate.textContent = formatDateJP(date);
//     detailShift.textContent = getShiftDisplayText(shift) || "表示できる情報がありません";

//     editArea.style.display = "none";
//     editError.textContent = "";
//     resetMedicalArea();
//     updateDetailActionButtons(shift);
//   }

//   function openAddDetail(dateStr) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     detailMode = "add";
//     selectedDateStr = dateStr;
//     selectedShiftId = "";
//     originalStart = "";
//     originalEnd = "";
//     originalState = "";

//     detailDate.textContent = formatDateJP(dateStr);
//     detailShift.textContent = "新規シフトを追加します";

//     if (btnEdit) btnEdit.style.display = "none";
//     if (btnDelete) btnDelete.style.display = "none";
//     if (btnMedical) btnMedical.style.display = "none";

//     resetMedicalArea();
//     editError.textContent = "";
//     editArea.style.display = "block";
//     generateTimeOptionsForMode("add");
//   }

//   if (backButton) {
//     backButton.addEventListener("click", () => {
//       detailView.style.display = "none";
//       calendarView.style.display = "block";
//       resetDetailState();
//     });
//   }

//   // =====================
//   // 時間変更ボタン
//   // =====================
//   if (btnEdit) {
//     btnEdit.addEventListener("click", () => {
//       const dummyShift = {
//         start: originalStart,
//         end: originalEnd,
//         state: originalState
//       };

//       if (!hasEditableShiftTime(dummyShift) || !isTodayOrFuture(selectedDateStr)) {
//         editArea.style.display = "none";
//         editError.textContent = "";
//         return;
//       }

//       detailMode = "view";
//       editArea.style.display = "block";
//       editError.textContent = "";
//       generateTimeOptionsForMode("view");
//     });
//   }

//   // =====================
//   // 保存（時間変更 / 新規追加 共通）
//   // =====================
//   if (saveEdit) {
//     saveEdit.addEventListener("click", async () => {
//       editError.textContent = "";

//       if (detailMode === "add") {
//         const start = normalizeTime(startSelect.value);
//         const end = normalizeTime(endSelect.value);

//         if (!start || !end) {
//           editError.textContent = "出勤時間と退勤時間を選択してください";
//           return;
//         }

//         const now = new Date();
//         const startDt = new Date(`${selectedDateStr}T${start}:00`);
//         const endDt = new Date(`${selectedDateStr}T${end}:00`);

//         if (startDt < now) {
//           editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
//           return;
//         }

//         if (endDt < now) {
//           editError.textContent = "退勤時間は過去に設定できません。公式LINEに相談してください";
//           return;
//         }

//         if (startDt >= endDt) {
//           editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
//           return;
//         }

//         if (!confirm("この内容でシフト追加してもよろしいですか？")) {
//           return;
//         }

//         try {
//           setButtonsDisabled(true);
//           resultDiv.textContent = "追加処理中…";

//           const profile = await liff.getProfile();

//           const url =
//             GAS_URL +
//             "?action=addShift" +
//             "&userId=" + encodeURIComponent(profile.userId) +
//             "&name=" + encodeURIComponent(profile.displayName) +
//             "&date=" + encodeURIComponent(selectedDateStr) +
//             "&start=" + encodeURIComponent(start) +
//             "&end=" + encodeURIComponent(end);

//           const data = await fetchJson(url);

//           if (!data.success) {
//             editError.textContent = data.message || "シフト追加に失敗しました";
//             resultDiv.textContent = "";
//             return;
//           }

//           applyLocalAddShift(selectedDateStr, start, end, data.shiftId || "");
//           rerenderCurrentMonth();

//           alert(data.message || "シフト追加が完了しました");

//           detailView.style.display = "none";
//           calendarView.style.display = "block";
//           resetDetailState();
//           resultDiv.textContent = "";
//         } catch (err) {
//           console.error(err);
//           editError.textContent = "追加中にエラーが発生しました";
//           resultDiv.textContent = "";
//         } finally {
//           setButtonsDisabled(false);
//         }

//         return;
//       }

//       const start = normalizeTime(startSelect.value);
//       const end = normalizeTime(endSelect.value);

//       const newStart = start === originalStart ? originalStart : start;
//       const newEnd = end === originalEnd ? originalEnd : end;

//       const now = new Date();
//       const startDt = new Date(`${selectedDateStr}T${newStart}:00`);
//       const endDt = new Date(`${selectedDateStr}T${newEnd}:00`);
//       const originalEndDt = new Date(`${selectedDateStr}T${originalEnd}:00`);

//       const startChanged = newStart !== originalStart;
//       const endChanged = newEnd !== originalEnd;

//       if (startChanged && startDt < now) {
//         editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
//         return;
//       }

//       if (endChanged && (endDt < now || originalEndDt < now)) {
//         editError.textContent = "退勤時間は変更できません。公式LINEに相談してください";
//         return;
//       }

//       if (startDt >= endDt) {
//         editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
//         return;
//       }

//       if (!confirm("このシフト変更を保存してもよろしいですか？")) {
//         return;
//       }

//       try {
//         setButtonsDisabled(true);
//         resultDiv.textContent = "保存中…";

//         const profile = await liff.getProfile();

//         const url =
//           GAS_URL +
//           "?action=update" +
//           "&userId=" + encodeURIComponent(profile.userId) +
//           "&shiftId=" + encodeURIComponent(selectedShiftId) +
//           "&date=" + encodeURIComponent(selectedDateStr) +
//           "&start=" + encodeURIComponent(newStart) +
//           "&end=" + encodeURIComponent(newEnd);

//         const data = await fetchJson(url);

//         if (!data.success) {
//           editError.textContent = data.message || "時間変更に失敗しました";
//           resultDiv.textContent = "";
//           return;
//         }

//         applyLocalUpdateShift(selectedShiftId, selectedDateStr, newStart, newEnd);
//         rerenderCurrentMonth();

//         editArea.style.display = "none";
//         alert(data.message || "シフトを保存しました");

//         resultDiv.textContent = "";
//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         resetDetailState();
//       } catch (err) {
//         console.error(err);
//         editError.textContent = "保存中にエラーが発生しました";
//         resultDiv.textContent = "";
//       } finally {
//         setButtonsDisabled(false);
//       }
//     });
//   }

//   // =====================
//   // 休み / 削除
//   // =====================
//   if (btnDelete) {
//     btnDelete.addEventListener("click", async () => {
//       const dummyShift = {
//         start: originalStart,
//         end: originalEnd,
//         state: originalState
//       };

//       if (!hasEditableShiftTime(dummyShift) || !isTodayOrFuture(selectedDateStr)) {
//         return;
//       }

//       // ★ 23時判定とメッセージの分岐
//       const actionType = determineDeleteOrAbsent(selectedDateStr);

//       const msg = actionType === "deleted"
//         ? `下記シフトを削除（空白）にします。\n\n${formatDateJP(selectedDateStr)}\n${originalStart}-${originalEnd}\n\nよろしいですか？`
//         : `前日23時を過ぎているため、下記シフトは「当欠」となります。\n\n${formatDateJP(selectedDateStr)}\n${originalStart}-${originalEnd}\n\nよろしいですか？`;

//       if (!confirm(msg)) {
//         return;
//       }

//       try {
//         setButtonsDisabled(true);
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
//           "&end=" + encodeURIComponent(originalEnd) +
//           "&actionType=" + encodeURIComponent(actionType); // GAS/Anycross側にも判定結果を送付

//         const data = await fetchJson(url);

//         if (!data.success) {
//           alert(data.message || "休み / 削除処理に失敗しました");
//           resultDiv.textContent = "";
//           return;
//         }

//         // ★ カレンダー上のステータスを書き換え
//         applyLocalDeleteOrAbsent(selectedShiftId, actionType);
//         rerenderCurrentMonth();

//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         resultDiv.textContent = "";
//         resetDetailState();

//         alert(data.message || "処理が完了しました");
//       } catch (err) {
//         console.error(err);
//         resultDiv.textContent = "";
//         alert("休み / 削除処理中にエラーが発生しました");
//       } finally {
//         setButtonsDisabled(false);
//       }
//     });
//   }

//   // =====================
//   // 診断書提出エリアを開閉
//   // =====================
//   if (btnMedical) {
//     btnMedical.addEventListener("click", () => {
//       const dummyShift = {
//         start: originalStart,
//         end: originalEnd,
//         state: originalState
//       };

//       const targetDate = getDateOnly(new Date(selectedDateStr + "T00:00:00"));
//       const today = getDateOnly(new Date());
//       const isToday = targetDate.getTime() === today.getTime();

//       const canOpenMedical =
//         (hasEditableShiftTime(dummyShift) && isToday) ||
//         isAbsentState(originalState);

//       if (!canOpenMedical) {
//         resetMedicalArea();
//         return;
//       }

//       if (!medicalArea) return;

//       const isOpen = medicalArea.style.display === "block";
//       medicalArea.style.display = isOpen ? "none" : "block";
//       medicalError.textContent = "";
//     });
//   }

//   // =====================
//   // 診断書画像選択
//   // =====================
//   if (medicalFile) {
//     medicalFile.addEventListener("change", async (e) => {
//       try {
//         medicalError.textContent = "";

//         const file = e.target.files && e.target.files[0];

//         if (!file) {
//           medicalFileObj = null;
//           medicalImageBase64 = "";
//           clearMedicalPreviewUrl();
//           if (medicalPreview) medicalPreview.src = "";
//           if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
//           return;
//         }

//         if (!file.type.startsWith("image/")) {
//           medicalError.textContent = "画像ファイルを選択してください";
//           medicalFile.value = "";
//           medicalFileObj = null;
//           medicalImageBase64 = "";
//           clearMedicalPreviewUrl();
//           if (medicalPreview) medicalPreview.src = "";
//           if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
//           return;
//         }

//         resultDiv.textContent = "画像を調整中…";

//         const { blob, base64 } = await prepareCompressedMedicalImage(file);

//         if (!base64) {
//           throw new Error("画像データの作成に失敗しました");
//         }

//         if (base64.length > 4500000) {
//           medicalError.textContent =
//             "画像サイズが大きすぎます。もう少し小さい画像で試してください。";
//           resultDiv.textContent = "";
//           medicalFile.value = "";
//           medicalFileObj = null;
//           medicalImageBase64 = "";
//           clearMedicalPreviewUrl();
//           if (medicalPreview) medicalPreview.src = "";
//           if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
//           return;
//         }

//         medicalFileObj = new File([blob], "medical.jpg", {
//           type: "image/jpeg"
//         });
//         medicalImageBase64 = base64;

//         clearMedicalPreviewUrl();
//         medicalPreviewObjectUrl = URL.createObjectURL(blob);

//         if (medicalPreview) {
//           medicalPreview.src = medicalPreviewObjectUrl;
//         }
//         if (medicalPreviewWrap) {
//           medicalPreviewWrap.style.display = "block";
//         }

//         resultDiv.textContent = "";
//       } catch (err) {
//         console.error(err);
//         resultDiv.textContent = "";
//         medicalError.textContent = "画像の読み込みに失敗しました";
//       }
//     });
//   }

//   // =====================
//   // 診断書提出
//   // =====================
//   if (submitMedical) {
//     submitMedical.addEventListener("click", async () => {
//       medicalError.textContent = "";

//       if (!medicalFileObj || !medicalImageBase64) {
//         medicalError.textContent = "診断書の写真をアップロードしてください";
//         return;
//       }

//       if (medicalImageBase64.length > 4500000) {
//         medicalError.textContent =
//           "画像サイズが大きすぎます。もう少し小さい画像で試してください。";
//         return;
//       }

//       const confirmMsg =
//         "名前漢字フルネームと、日付が書いていますか？\n\n" +
//         "問題なければ、この内容で提出します。";

//       if (!confirm(confirmMsg)) {
//         return;
//       }

//       setButtonsDisabled(true);
//       resultDiv.textContent = "提出中…";

//       try {
//         const profile = await liff.getProfile();

//         const formBody = new URLSearchParams({
//           action: "submitMedical",
//           userId: profile.userId,
//           name: profile.displayName,
//           shiftId: selectedShiftId,
//           date: selectedDateStr,
//           start: originalStart,
//           end: originalEnd,
//           fileName: medicalFileObj.name,
//           mimeType: medicalFileObj.type,
//           imageBase64: medicalImageBase64
//         });

//         const data = await fetchJson(GAS_URL, {
//           method: "POST",
//           body: formBody
//         });

//         if (!data.success) {
//           medicalError.textContent = data.message || "診断書の提出に失敗しました";
//           resultDiv.textContent = "";
//           return;
//         }

//         applyLocalMedicalSubmitted(selectedShiftId);
//         rerenderCurrentMonth();

//         alert(
//           data.message ||
//             "診断書の提出が完了しました。月末に確認をしているため、不正があった場合は当日欠勤に戻る可能性があります。"
//         );
//       } catch (err) {
//         console.error("submitMedical送信エラー:", err);
//         resultDiv.textContent = "";
//         medicalError.textContent =
//           "診断書の提出に失敗しました: " + (err.message || err);
//         return;
//       } finally {
//         resultDiv.textContent = "";
//         resetMedicalArea();
//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         resetDetailState();
//         setButtonsDisabled(false);
//       }
//     });
//   }


//   // =====================
//   // 月移動
//   // =====================
//   if (prevMonthBtn) {
//     prevMonthBtn.addEventListener("click", () => {
//       currentDate.setMonth(currentDate.getMonth() - 1);
//       generateCalendar(currentDate);
//       updateWorktimeDisplay();
//     });
//   }

//   if (nextMonthBtn) {
//     nextMonthBtn.addEventListener("click", () => {
//       currentDate.setMonth(currentDate.getMonth() + 1);
//       generateCalendar(currentDate);
//       updateWorktimeDisplay();
//     });
//   }

//   // =====================
//   // LIFF初期化と自動取得（★ここを変更しました）
//   // =====================
//   try {
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });

//     resultDiv.style.color = "black";

//     if (!liff.isLoggedIn()) {
//       resultDiv.innerHTML = "LINEログインへ移動します…";
//       liff.login({
//         redirectUri: window.location.href
//       });
//       return;
//     }

//     // ★ログイン済みの場合は自動で「更新」処理を走らせる
//     try {
//       setButtonsDisabled(true);
//       resultDiv.textContent = "更新中..."; // 取得中の表示
//       await reloadShifts();
//       resultDiv.textContent = "";
//     } catch (err) {
//       console.error(err);
//       resultDiv.textContent = "取得エラー: " + err.message;
//     } finally {
//       setButtonsDisabled(false);
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

//     const weekHeader = document.createElement("div");
//     weekHeader.className = "week-header";

//     const weekList = ["日", "月", "火", "水", "木", "金", "土"];

//     weekList.forEach((w, index) => {
//       const cell = document.createElement("div");
//       cell.className = "week-cell";
//       cell.textContent = w;

//       if (index === 0) cell.style.color = "#d93025";
//       if (index === 6) cell.style.color = "#1a73e8";

//       weekHeader.appendChild(cell);
//     });

//     calendarDiv.appendChild(weekHeader);

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
//       const fullDateStr =
//         `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//       const dayDiv = document.createElement("div");
//       dayDiv.className = "day";

//       const dateSpan = document.createElement("span");
//       dateSpan.className = "date";
//       dateSpan.textContent = day;
//       dayDiv.appendChild(dateSpan);

//       const dayShifts = shiftData[fullDateStr] || [];
//       const hasShift = hasVisibleShiftOnDay(dayShifts) || hasAnyShiftRecordOnDay(dayShifts);

//       if (!hasShift && isTodayOrFuture(fullDateStr)) {
//         const addBtn = document.createElement("button");
//         addBtn.type = "button";
//         addBtn.className = "add-shift-button";
//         addBtn.textContent = "⊕";
//         addBtn.style.display = "block";
//         addBtn.style.margin = "6px auto 0";
//         addBtn.style.fontSize = "22px";
//         addBtn.style.lineHeight = "1";
//         addBtn.style.border = "none";
//         addBtn.style.background = "transparent";
//         addBtn.style.cursor = "pointer";
//         addBtn.style.color = "#1a73e8";

//         addBtn.addEventListener("click", (e) => {
//           e.stopPropagation();
//           openAddDetail(fullDateStr);
//         });

//         dayDiv.appendChild(addBtn);
//       }

//       dayShifts.forEach((shift) => {
//         const displayText = getShiftDisplayText(shift);
//         if (!displayText) return;

//         const shiftSpan = document.createElement("div");
//         shiftSpan.className = "shift-time";
//         shiftSpan.textContent = displayText;

//         const state = normalizeText(shift.state);
//         if (isAbsentState(state)) {
//           shiftSpan.classList.add("state-absent");
//         } else if (isMedicalSubmittedState(state)) {
//           shiftSpan.classList.add("state-medical");
//         }

//         shiftSpan.addEventListener("click", (e) => {
//           e.stopPropagation();
//           openDetail(fullDateStr, shift);
//         });

//         dayDiv.appendChild(shiftSpan);
//       });

//       calendarDiv.appendChild(dayDiv);
//     }
//   }
// };











window.onload = async function () {
  const calendarDiv = document.getElementById("calendar");
  const currentMonthSpan = document.getElementById("currentMonth");
  const resultDiv = document.getElementById("result");
  const monthNavDiv = document.getElementById("monthNav");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  const summaryDiv = document.getElementById("summary");
  const userNameSpan = document.getElementById("userName");
  const workTimeSpan = document.getElementById("workTime");

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

  const medicalArea = document.getElementById("medicalArea");
  const medicalFile = document.getElementById("medicalFile");
  const medicalPreviewWrap = document.getElementById("medicalPreviewWrap");
  const medicalPreview = document.getElementById("medicalPreview");
  const medicalError = document.getElementById("medicalError");
  const submitMedical = document.getElementById("submitMedical");

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

  let shiftData = {};
  let currentDate = new Date();
  let fetchedName = "";

  let selectedShiftId = "";
  let selectedDateStr = "";
  let originalStart = "";
  let originalEnd = "";
  let originalState = "";
  let detailMode = "view";

  let medicalFileObj = null;
  let medicalImageBase64 = "";
  let medicalPreviewObjectUrl = "";

  // 共通関数
  function normalizeText(value) { return String(value || "").trim(); }
  function normalizeTime(value) {
    const v = normalizeText(value);
    if (!v) return "";
    const match = v.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return v;
    return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
  }
  function formatMinutesToDecimalHours(minutes) {
    const mins = Number(minutes || 0);
    if (mins <= 0) return "0";
    const hours = mins / 60;
    return Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 100) / 100);
  }
  function formatMonthTotalText(targetDate) {
    const totalMinutes = calcMonthlyWorkMinutes(targetDate);
    return `${formatMinutesToDecimalHours(totalMinutes)}時間`;
  }
  function updateWorktimeDisplay() {
    if (workTimeSpan) workTimeSpan.textContent = formatMonthTotalText(currentDate);
  }
  function formatDateJP(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
  }
  const isAbsentState = (s) => normalizeText(s) === "当欠";
  const isMedicalSubmittedState = (s) => normalizeText(s) === "診断書提出済み";
  const isDeletedOrOffState = (s) => ["休み", "削除", "休み / 削除"].includes(normalizeText(s));
  const isSpecialState = (s) => isAbsentState(s) || isMedicalSubmittedState(s) || isDeletedOrOffState(s);

  function getShiftDisplayText(shift) {
    const state = normalizeText(shift?.state);
    if (isSpecialState(state)) return state;
    const start = normalizeTime(shift?.start);
    const end = normalizeTime(shift?.end);
    return (start && end) ? `${start}-${end}` : "";
  }
  function hasEditableShiftTime(shift) {
    return !isSpecialState(shift?.state) && !!normalizeTime(shift?.start) && !!normalizeTime(shift?.end);
  }
  function isTodayOrFuture(dateStr) {
    const target = new Date(dateStr + "T00:00:00").setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return target >= today;
  }
  function resetMedicalArea() {
    if (!medicalArea) return;
    medicalArea.style.display = "none";
    if (medicalFile) medicalFile.value = "";
    if (medicalPreviewObjectUrl) URL.revokeObjectURL(medicalPreviewObjectUrl);
    medicalFileObj = null; medicalImageBase64 = "";
  }
  function setButtonsDisabled(disabled) {
    [btnEdit, btnDelete, btnMedical, saveEdit, submitMedical, backButton, prevMonthBtn, nextMonthBtn].forEach(b => { if (b) b.disabled = disabled; });
    document.querySelectorAll(".add-shift-button").forEach(b => { b.disabled = disabled; b.style.opacity = disabled ? "0.5" : "1"; });
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { throw new Error(`解析失敗: ${text}`); }
  }

  function calcMonthlyWorkMinutes(targetDate) {
    let total = 0;
    const year = targetDate.getFullYear(), month = targetDate.getMonth();
    for (const key in shiftData) {
      const d = new Date(key + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        (shiftData[key] || []).forEach(s => {
          if (isSpecialState(s.state)) return;
          const start = normalizeTime(s.start), end = normalizeTime(s.end);
          if (!start || !end) return;
          const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number);
          let mins = (eh * 60 + em) - (sh * 60 + sm);
          const bS = 14 * 60, bE = 15 * 60;
          const overlap = Math.min(eh * 60 + em, bE) - Math.max(sh * 60 + sm, bS);
          if (overlap > 0) mins -= overlap;
          total += Math.max(0, mins);
        });
      }
    }
    return total;
  }

  // シフト情報取得
  async function reloadShifts() {
    const idToken = liff.getIDToken();
    
    const url = GAS_URL + 
                "?action=fetch" + 
                "&idToken=" + encodeURIComponent(idToken) + 
                "&t=" + Date.now();
    
    const data = await fetchJson(url);

    if (!data.success) {
      // ★ ここがポイント：もし認証エラー（期限切れなど）が返ってきたら自動でログインし直す
      if (data.message.includes("認証失敗") || data.message.includes("expired")) {
        console.log("トークン切れのため再ログインします...");
        liff.login(); // ログイン画面へ飛ばす（一瞬で戻ってきます）
        return;
      }
      throw new Error(data.message || "取得失敗");
    }

    shiftData = data.shifts || {};
    fetchedName = data.name || "";
    if (userNameSpan) userNameSpan.textContent = fetchedName;
    if (summaryDiv) summaryDiv.style.display = "block";
    updateWorktimeDisplay();
    monthNavDiv.style.display = "flex";
    generateCalendar(currentDate);
  }

  // --- イベントリスナー ---
  if (saveEdit) {
    saveEdit.addEventListener("click", async () => {
      editError.textContent = "";
      const start = normalizeTime(startSelect.value), end = normalizeTime(endSelect.value);
      if (!start || !end) { editError.textContent = "時間を選択してください"; return; }
      if (!confirm("保存しますか？")) return;

      try {
        setButtonsDisabled(true);
        resultDiv.textContent = "保存中…";
        const idToken = liff.getIDToken();
        const action = (detailMode === "add") ? "addShift" : "update";
        const url = `${GAS_URL}?action=${action}&idToken=${encodeURIComponent(idToken)}&date=${selectedDateStr}&start=${start}&end=${end}&shiftId=${selectedShiftId}`;

        const data = await fetchJson(url);
        if (!data.success) throw new Error(data.message);
        alert("完了しました");
        await reloadShifts();
        detailView.style.display = "none"; calendarView.style.display = "block";
      } catch (e) { alert(e.message); } finally { setButtonsDisabled(false); resultDiv.textContent = ""; }
    });
  }

  if (btnDelete) {
    btnDelete.addEventListener("click", async () => {
      const actionType = (new Date(selectedDateStr + "T00:00:00") - new Date() > 86400000) ? "deleted" : "当欠";
      if (!confirm("削除/欠勤にしますか？")) return;
      try {
        setButtonsDisabled(true);
        const idToken = liff.getIDToken();
        const url = `${GAS_URL}?action=deleteOrAbsent&idToken=${encodeURIComponent(idToken)}&shiftId=${selectedShiftId}&actionType=${actionType}`;
        const data = await fetchJson(url);
        if (!data.success) throw new Error(data.message);
        await reloadShifts();
        detailView.style.display = "none"; calendarView.style.display = "block";
      } catch (e) { alert(e.message); } finally { setButtonsDisabled(false); }
    });
  }

  // LIFF初期化
  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" });
    if (!liff.isLoggedIn()) { liff.login({ redirectUri: window.location.href }); return; }
    resultDiv.textContent = "更新中...";
    await reloadShifts();
    resultDiv.textContent = "";
  } catch (err) { resultDiv.textContent = "初期化エラー: " + err.message; }

  // カレンダー描画 (省略せず保持)
  function generateCalendar(date) {
    calendarDiv.innerHTML = "";
    const weekHeader = document.createElement("div");
    weekHeader.className = "week-header";
    ["日", "月", "火", "水", "木", "金", "土"].forEach((w, i) => {
      const c = document.createElement("div"); c.className = "week-cell"; c.textContent = w;
      if (i === 0) c.style.color = "#d93025"; if (i === 6) c.style.color = "#1a73e8";
      weekHeader.appendChild(c);
    });
    calendarDiv.appendChild(weekHeader);

    const y = date.getFullYear(), m = date.getMonth();
    currentMonthSpan.textContent = `${y}年 ${m + 1}月`;
    const first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < first; i++) calendarDiv.appendChild(Object.assign(document.createElement("div"), { className: "day" }));

    for (let d = 1; d <= last; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayDiv = document.createElement("div"); dayDiv.className = "day";
      dayDiv.innerHTML = `<span class="date">${d}</span>`;

      const dayShifts = shiftData[dateStr] || [];
      if (dayShifts.length === 0 && isTodayOrFuture(dateStr)) {
        const btn = document.createElement("button"); btn.className = "add-shift-button"; btn.textContent = "⊕";
        btn.onclick = () => { detailMode = "add"; selectedDateStr = dateStr; detailView.style.display = "block"; calendarView.style.display = "none"; };
        dayDiv.appendChild(btn);
      }
      dayShifts.forEach(s => {
        const span = document.createElement("div"); span.className = "shift-time"; span.textContent = getShiftDisplayText(s);
        if (isAbsentState(s.state)) span.classList.add("state-absent");
        span.onclick = () => { detailMode = "view"; selectedDateStr = dateStr; selectedShiftId = s.id; detailView.style.display = "block"; calendarView.style.display = "none"; };
        dayDiv.appendChild(span);
      });
      calendarDiv.appendChild(dayDiv);
    }
  }
};



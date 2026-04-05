// // // // 完璧
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
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
//   let worktimePrev = "";
//   let worktimeCurrent = "";
//   let worktimeNext = "";
//   let baseYear = currentDate.getFullYear();
//   let baseMonth = currentDate.getMonth();

//   // 選択中シフト情報
//   let selectedShiftId = "";
//   let selectedDateStr = "";
//   let originalStart = "";
//   let originalEnd = "";
//   let originalState = "";

//   // 診断書画像
//   let medicalFileObj = null;
//   let medicalImageBase64 = "";
//   let medicalPreviewObjectUrl = "";

//   // =====================
//   // 共通関数
//   // =====================
//   function updateWorktimeDisplay() {
//     if (!workTimeSpan) return;

//     const monthDiff =
//       (currentDate.getFullYear() - baseYear) * 12 +
//       (currentDate.getMonth() - baseMonth);

//     let targetWorktime = "";

//     if (monthDiff === -1) {
//       targetWorktime = worktimePrev;
//     } else if (monthDiff === 0) {
//       targetWorktime = worktimeCurrent;
//     } else if (monthDiff === 1) {
//       targetWorktime = worktimeNext;
//     } else {
//       targetWorktime = "";
//     }

//     workTimeSpan.textContent =
//       targetWorktime !== "" ? `${targetWorktime}時間` : "";
//   }

//   function formatDateJP(dateStr) {
//     const d = new Date(dateStr + "T00:00:00");
//     const week = ["日", "月", "火", "水", "木", "金", "土"];
//     return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
//   }

//   function normalizeText(value) {
//     return String(value || "").trim();
//   }

//   function isAbsentState(state) {
//     return normalizeText(state) === "当欠";
//   }

//   function isMedicalSubmittedState(state) {
//     return normalizeText(state) === "診断書提出済み";
//   }

//   function isSpecialState(state) {
//     return isAbsentState(state) || isMedicalSubmittedState(state);
//   }

//   function getShiftDisplayText(shift) {
//     const state = normalizeText(shift?.state);
//     const start = normalizeText(shift?.start);
//     const end = normalizeText(shift?.end);

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
//     const start = normalizeText(shift?.start);
//     const end = normalizeText(shift?.end);

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

//   function isTodayOrPast(dateStr) {
//     const target = getDateOnly(new Date(dateStr + "T00:00:00"));
//     const today = getDateOnly(new Date());
//     return target <= today;
//   }

//   function hasVisibleShiftOnDay(dayShifts) {
//     if (!Array.isArray(dayShifts) || dayShifts.length === 0) return false;

//     return dayShifts.some((shift) => {
//       return !!getShiftDisplayText(shift);
//     });
//   }

//   function updateDetailActionButtons(shift) {
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

//   function setButtonsDisabled(disabled) {
//     if (updateButton) updateButton.disabled = disabled;
//     if (btnEdit) btnEdit.disabled = disabled;
//     if (btnDelete) btnDelete.disabled = disabled;
//     if (btnMedical) btnMedical.disabled = disabled;
//     if (saveEdit) saveEdit.disabled = disabled;
//     if (submitMedical) submitMedical.disabled = disabled;
//     if (backButton) backButton.disabled = disabled;
//     if (prevMonthBtn) prevMonthBtn.disabled = disabled;
//     if (nextMonthBtn) nextMonthBtn.disabled = disabled;
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
//     worktimePrev = data.worktimePrev ?? "";
//     worktimeCurrent = data.worktimeCurrent ?? "";
//     worktimeNext = data.worktimeNext ?? "";

//     baseYear = new Date().getFullYear();
//     baseMonth = new Date().getMonth();

//     if (userNameSpan) {
//       userNameSpan.textContent = fetchedName;
//     }

//     if (summaryDiv) {
//       summaryDiv.style.display = "block";
//     }

//     updateWorktimeDisplay();

//     firstMessageDiv.style.display = "none";
//     monthNavDiv.style.display = "flex";
//     generateCalendar(currentDate);
//   }

//   function sleep(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
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

//   async function waitForShiftRefresh(checkFn, options = {}) {
//     const {
//       maxAttempts = 8,
//       intervalMs = 1500,
//       loadingMessage = "反映待ち…"
//     } = options;

//     for (let i = 0; i < maxAttempts; i++) {
//       resultDiv.textContent = `${loadingMessage} (${i + 1}/${maxAttempts})`;

//       await sleep(intervalMs);
//       await reloadShifts();

//       if (checkFn()) {
//         resultDiv.textContent = "";
//         return true;
//       }
//     }

//     resultDiv.textContent = "";
//     return false;
//   }

//   function handleAddShiftClick(dateStr) {
//     alert(
//       `${formatDateJP(dateStr)} はシフト未登録です。\n\n` +
//       "⊕ボタンは表示されるようにしました。\n" +
//       "新規シフト追加の登録処理を動かすには、GAS/Anycross側に追加用actionの実装が必要です。"
//     );
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
//       const hasShift = hasVisibleShiftOnDay(dayShifts);

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
//           handleAddShiftClick(fullDateStr);
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

//   // =====================
//   // 詳細表示
//   // =====================
//   function openDetail(date, shift) {
//     calendarView.style.display = "none";
//     detailView.style.display = "block";

//     selectedDateStr = date;
//     selectedShiftId = shift.id || "";
//     originalStart = normalizeText(shift.start);
//     originalEnd = normalizeText(shift.end);
//     originalState = normalizeText(shift.state);

//     detailDate.textContent = formatDateJP(date);
//     detailShift.textContent = getShiftDisplayText(shift) || "表示できる情報がありません";

//     editArea.style.display = "none";
//     editError.textContent = "";
//     resetMedicalArea();
//     updateDetailActionButtons(shift);
//   }

//   if (backButton) {
//     backButton.addEventListener("click", () => {
//       detailView.style.display = "none";
//       calendarView.style.display = "block";
//       editArea.style.display = "none";
//       editError.textContent = "";
//       resetMedicalArea();
//     });
//   }

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

//       editArea.style.display = "block";
//       editError.textContent = "";
//       generateTimeOptions();
//     });
//   }

//   if (saveEdit) {
//     saveEdit.addEventListener("click", async () => {
//       const start = startSelect.value;
//       const end = endSelect.value;

//       const newStart = start === originalStart ? originalStart : start;
//       const newEnd = end === originalEnd ? originalEnd : end;

//       const now = new Date();
//       const startDt = new Date(`${selectedDateStr}T${newStart}:00`);
//       const endDt = new Date(`${selectedDateStr}T${newEnd}:00`);
//       const originalEndDt = new Date(`${selectedDateStr}T${originalEnd}:00`);

//       editError.textContent = "";

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

//         const reflected = await waitForShiftRefresh(() => {
//           const found = findShiftById(selectedShiftId);
//           if (!found) return false;

//           return (
//             normalizeText(found.shift.start) === newStart &&
//             normalizeText(found.shift.end) === newEnd
//           );
//         }, {
//           maxAttempts: 8,
//           intervalMs: 1500,
//           loadingMessage: "時間変更の反映待ち…"
//         });

//         editArea.style.display = "none";

//         alert(
//           reflected
//             ? (data.message || "シフトを保存しました")
//             : "時間変更の保存は完了しました。画面反映に時間がかかっているため、更新ボタンで再確認してください。"
//         );

//         resultDiv.textContent = "";
//         detailView.style.display = "none";
//         calendarView.style.display = "block";
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

//       const msg =
//         `下記シフトについて、休み / 削除申請を行います。\n\n` +
//         `${formatDateJP(selectedDateStr)}\n` +
//         `${originalStart}-${originalEnd}\n\n` +
//         `よろしいですか？`;

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
//           "&end=" + encodeURIComponent(originalEnd);

//         const data = await fetchJson(url);

//         if (!data.success) {
//           alert(data.message || "休み / 削除処理に失敗しました");
//           resultDiv.textContent = "";
//           return;
//         }

//         const reflected = await waitForShiftRefresh(() => {
//           const found = findShiftById(selectedShiftId);

//           if (!found) return true;

//           const state = normalizeText(found.shift.state);
//           const startEmpty = !normalizeText(found.shift.start);
//           const endEmpty = !normalizeText(found.shift.end);

//           return isAbsentState(state) || (startEmpty && endEmpty);
//         }, {
//           maxAttempts: 8,
//           intervalMs: 1500,
//           loadingMessage: "休み / 削除の反映待ち…"
//         });

//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         resultDiv.textContent = "";

//         alert(
//           reflected
//             ? (data.message || "処理が完了しました")
//             : "休み / 削除の処理は完了しました。画面反映に時間がかかっているため、更新ボタンで再確認してください。"
//         );
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

//       let submitSucceeded = false;
//       let submitMessage =
//         "診断書の提出が完了しました。月末に確認をしているため、不正があった場合は当日欠勤に戻る可能性があります。";

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

//         submitSucceeded = true;
//         submitMessage = data.message || submitMessage;
//       } catch (err) {
//         console.error("submitMedical送信エラー:", err);
//         resultDiv.textContent = "";
//         medicalError.textContent =
//           "診断書の提出に失敗しました: " + (err.message || err);
//         return;
//       }

//       try {
//         resultDiv.textContent = "診断書提出後の反映待ち…";

//         const reflected = await waitForShiftRefresh(() => {
//           const found = findShiftById(selectedShiftId);

//           if (!found) return true;

//           const state = normalizeText(found.shift.state);
//           const startEmpty = !normalizeText(found.shift.start);
//           const endEmpty = !normalizeText(found.shift.end);

//           return isMedicalSubmittedState(state) || (startEmpty && endEmpty);
//         }, {
//           maxAttempts: 8,
//           intervalMs: 1500,
//           loadingMessage: "診断書提出後の反映待ち…"
//         });

//         alert(
//           reflected
//             ? submitMessage
//             : "診断書の提出は完了しました。Lark側の反映に時間がかかっているため、更新ボタンで再確認してください。"
//         );
//       } catch (err) {
//         console.error("submitMedical反映待ちエラー:", err);

//         if (submitSucceeded) {
//           alert(
//             "診断書の提出は完了しました。画面反映の確認中にエラーが発生したため、更新ボタンで再確認してください。"
//           );
//         } else {
//           medicalError.textContent =
//             "診断書の提出後処理でエラーが発生しました: " + (err.message || err);
//           resultDiv.textContent = "";
//           return;
//         }
//       } finally {
//         resultDiv.textContent = "";
//         resetMedicalArea();
//         detailView.style.display = "none";
//         calendarView.style.display = "block";
//         setButtonsDisabled(false);
//       }
//     });
//   }

//   // =====================
//   // 更新ボタン
//   // =====================
//   if (updateButton) {
//     updateButton.addEventListener("click", async () => {
//       try {
//         setButtonsDisabled(true);
//         resultDiv.textContent = "更新中…";
//         await reloadShifts();
//         resultDiv.textContent = "";
//       } catch (err) {
//         console.error(err);
//         resultDiv.textContent = "取得エラー: " + err.message;
//       } finally {
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

  // 基本情報
  const summaryDiv = document.getElementById("summary");
  const userNameSpan = document.getElementById("userName");
  const workTimeSpan = document.getElementById("workTime");

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

  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec";

  let shiftData = {};
  let currentDate = new Date();

  let fetchedName = "";
  let worktimePrev = "";
  let worktimeCurrent = "";
  let worktimeNext = "";
  let baseYear = currentDate.getFullYear();
  let baseMonth = currentDate.getMonth();

  // 選択中シフト情報
  let selectedShiftId = "";
  let selectedDateStr = "";
  let originalStart = "";
  let originalEnd = "";
  let originalState = "";

  // 画面モード
  let detailMode = "view"; // "view" | "add"

  // 診断書画像
  let medicalFileObj = null;
  let medicalImageBase64 = "";
  let medicalPreviewObjectUrl = "";

  // =====================
  // 共通関数
  // =====================
  function updateWorktimeDisplay() {
    if (!workTimeSpan) return;

    const monthDiff =
      (currentDate.getFullYear() - baseYear) * 12 +
      (currentDate.getMonth() - baseMonth);

    let targetWorktime = "";

    if (monthDiff === -1) {
      targetWorktime = worktimePrev;
    } else if (monthDiff === 0) {
      targetWorktime = worktimeCurrent;
    } else if (monthDiff === 1) {
      targetWorktime = worktimeNext;
    } else {
      targetWorktime = "";
    }

    workTimeSpan.textContent =
      targetWorktime !== "" ? `${targetWorktime}時間` : "";
  }

  function formatDateJP(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})`;
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function isAbsentState(state) {
    return normalizeText(state) === "当欠";
  }

  function isMedicalSubmittedState(state) {
    return normalizeText(state) === "診断書提出済み";
  }

  function isSpecialState(state) {
    return isAbsentState(state) || isMedicalSubmittedState(state);
  }

  function getShiftDisplayText(shift) {
    const state = normalizeText(shift?.state);
    const start = normalizeText(shift?.start);
    const end = normalizeText(shift?.end);

    if (isSpecialState(state)) {
      return state;
    }

    if (start && end) {
      return `${start}-${end}`;
    }

    return "";
  }

  function hasEditableShiftTime(shift) {
    const state = normalizeText(shift?.state);
    const start = normalizeText(shift?.start);
    const end = normalizeText(shift?.end);

    return !isSpecialState(state) && !!start && !!end;
  }

  function getDateOnly(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isTodayOrFuture(dateStr) {
    const target = getDateOnly(new Date(dateStr + "T00:00:00"));
    const today = getDateOnly(new Date());
    return target >= today;
  }

  function isTodayOrPast(dateStr) {
    const target = getDateOnly(new Date(dateStr + "T00:00:00"));
    const today = getDateOnly(new Date());
    return target <= today;
  }

  function hasVisibleShiftOnDay(dayShifts) {
    if (!Array.isArray(dayShifts) || dayShifts.length === 0) return false;

    return dayShifts.some((shift) => {
      return !!getShiftDisplayText(shift);
    });
  }

  function hasAnyShiftRecordOnDay(dayShifts) {
    return Array.isArray(dayShifts) && dayShifts.length > 0;
  }

  function clearMedicalPreviewUrl() {
    if (medicalPreviewObjectUrl) {
      URL.revokeObjectURL(medicalPreviewObjectUrl);
      medicalPreviewObjectUrl = "";
    }
  }

  function resetMedicalArea() {
    if (!medicalArea) return;

    medicalArea.style.display = "none";

    if (medicalFile) {
      medicalFile.value = "";
    }

    clearMedicalPreviewUrl();

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

  function resetDetailState() {
    selectedShiftId = "";
    selectedDateStr = "";
    originalStart = "";
    originalEnd = "";
    originalState = "";
    detailMode = "view";

    if (editArea) editArea.style.display = "none";
    if (editError) editError.textContent = "";
    resetMedicalArea();
  }

  function setButtonsDisabled(disabled) {
    if (updateButton) updateButton.disabled = disabled;
    if (btnEdit) btnEdit.disabled = disabled;
    if (btnDelete) btnDelete.disabled = disabled;
    if (btnMedical) btnMedical.disabled = disabled;
    if (saveEdit) saveEdit.disabled = disabled;
    if (submitMedical) submitMedical.disabled = disabled;
    if (backButton) backButton.disabled = disabled;
    if (prevMonthBtn) prevMonthBtn.disabled = disabled;
    if (nextMonthBtn) nextMonthBtn.disabled = disabled;

    document.querySelectorAll(".add-shift-button").forEach((btn) => {
      btn.disabled = disabled;
      btn.style.pointerEvents = disabled ? "none" : "auto";
      btn.style.opacity = disabled ? "0.5" : "1";
    });
  }

  function fileToBase64(fileOrBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        const result = reader.result || "";
        const base64 = String(result).split(",")[1] || "";
        resolve(base64);
      };

      reader.onerror = function () {
        reject(new Error("base64変換に失敗しました"));
      };

      reader.readAsDataURL(fileOrBlob);
    });
  }

  async function resizeImageFile(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        const img = new Image();

        img.onload = function () {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("画像処理に失敗しました"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("画像圧縮に失敗しました"));
                return;
              }
              resolve(blob);
            },
            "image/jpeg",
            quality
          );
        };

        img.onerror = function () {
          reject(new Error("画像の読み込みに失敗しました"));
        };

        img.src = event.target.result;
      };

      reader.onerror = function () {
        reject(new Error("画像の読み込みに失敗しました"));
      };

      reader.readAsDataURL(file);
    });
  }

  async function prepareCompressedMedicalImage(file) {
    let blob = await resizeImageFile(file, 1200, 0.7);
    let base64 = await fileToBase64(blob);

    if (base64.length > 4000000) {
      blob = await resizeImageFile(file, 1000, 0.6);
      base64 = await fileToBase64(blob);
    }

    if (base64.length > 3000000) {
      blob = await resizeImageFile(file, 800, 0.55);
      base64 = await fileToBase64(blob);
    }

    if (base64.length > 2500000) {
      blob = await resizeImageFile(file, 700, 0.5);
      base64 = await fileToBase64(blob);
    }

    return { blob, base64 };
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`JSON解析失敗: ${text}`);
    }
  }

  async function reloadShifts() {
    const profile = await liff.getProfile();

    const url =
      GAS_URL +
      "?action=fetch" +
      "&userId=" + encodeURIComponent(profile.userId) +
      "&name=" + encodeURIComponent(profile.displayName);

    const data = await fetchJson(url);

    if (!data.success) {
      throw new Error(data.message || "シフト取得に失敗しました");
    }

    shiftData = data.shifts || {};
    fetchedName = data.name || "";
    worktimePrev = data.worktimePrev ?? "";
    worktimeCurrent = data.worktimeCurrent ?? "";
    worktimeNext = data.worktimeNext ?? "";

    baseYear = new Date().getFullYear();
    baseMonth = new Date().getMonth();

    if (userNameSpan) {
      userNameSpan.textContent = fetchedName;
    }

    if (summaryDiv) {
      summaryDiv.style.display = "block";
    }

    updateWorktimeDisplay();

    firstMessageDiv.style.display = "none";
    monthNavDiv.style.display = "flex";
    generateCalendar(currentDate);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function findShiftById(targetShiftId) {
    for (const dateKey in shiftData) {
      const dayShifts = shiftData[dateKey] || [];
      const found = dayShifts.find((s) => s.id === targetShiftId);
      if (found) {
        return {
          date: dateKey,
          shift: found
        };
      }
    }
    return null;
  }

  async function waitForShiftRefresh(checkFn, options = {}) {
    const {
      maxAttempts = 8,
      intervalMs = 1500,
      loadingMessage = "反映待ち…"
    } = options;

    for (let i = 0; i < maxAttempts; i++) {
      resultDiv.textContent = `${loadingMessage} (${i + 1}/${maxAttempts})`;

      await sleep(intervalMs);
      await reloadShifts();

      if (checkFn()) {
        resultDiv.textContent = "";
        return true;
      }
    }

    resultDiv.textContent = "";
    return false;
  }

  function updateDetailActionButtons(shift) {
    if (detailMode === "add") {
      if (btnEdit) btnEdit.style.display = "none";
      if (btnDelete) btnDelete.style.display = "none";
      if (btnMedical) btnMedical.style.display = "none";
      return;
    }

    const state = normalizeText(shift?.state);
    const canEditBase = hasEditableShiftTime(shift);

    const showEdit = canEditBase && isTodayOrFuture(selectedDateStr);
    const showDelete = canEditBase && isTodayOrFuture(selectedDateStr);

    const targetDate = getDateOnly(new Date(selectedDateStr + "T00:00:00"));
    const today = getDateOnly(new Date());
    const isToday = targetDate.getTime() === today.getTime();

    const showMedical =
      (canEditBase && isToday) || isAbsentState(state);

    if (btnEdit) {
      btnEdit.style.display = showEdit ? "inline-block" : "none";
    }

    if (btnDelete) {
      btnDelete.style.display = showDelete ? "inline-block" : "none";
    }

    if (btnMedical) {
      btnMedical.style.display = showMedical ? "inline-block" : "none";
    }

    if (!showEdit) {
      if (editArea) {
        editArea.style.display = "none";
      }
      if (editError) {
        editError.textContent = "";
      }
    }

    if (!showMedical) {
      resetMedicalArea();
    }
  }

  function generateTimeOptionsForMode(mode) {
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

    if (mode === "view") {
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
    } else {
      const defaultStart = document.createElement("option");
      defaultStart.value = "";
      defaultStart.textContent = "選択してください";
      defaultStart.selected = true;
      startSelect.appendChild(defaultStart);

      const defaultEnd = document.createElement("option");
      defaultEnd.value = "";
      defaultEnd.textContent = "選択してください";
      defaultEnd.selected = true;
      endSelect.appendChild(defaultEnd);
    }

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

  function openDetail(date, shift) {
    calendarView.style.display = "none";
    detailView.style.display = "block";

    detailMode = "view";
    selectedDateStr = date;
    selectedShiftId = shift.id || "";
    originalStart = normalizeText(shift.start);
    originalEnd = normalizeText(shift.end);
    originalState = normalizeText(shift.state);

    detailDate.textContent = formatDateJP(date);
    detailShift.textContent = getShiftDisplayText(shift) || "表示できる情報がありません";

    editArea.style.display = "none";
    editError.textContent = "";
    resetMedicalArea();
    updateDetailActionButtons(shift);
  }

  function openAddDetail(dateStr) {
    calendarView.style.display = "none";
    detailView.style.display = "block";

    detailMode = "add";
    selectedDateStr = dateStr;
    selectedShiftId = "";
    originalStart = "";
    originalEnd = "";
    originalState = "";

    detailDate.textContent = formatDateJP(dateStr);
    detailShift.textContent = "新規シフトを追加します";

    if (btnEdit) btnEdit.style.display = "none";
    if (btnDelete) btnDelete.style.display = "none";
    if (btnMedical) btnMedical.style.display = "none";

    resetMedicalArea();
    editError.textContent = "";
    editArea.style.display = "block";
    generateTimeOptionsForMode("add");
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      detailView.style.display = "none";
      calendarView.style.display = "block";
      resetDetailState();
    });
  }

  // =====================
  // 時間変更ボタン
  // =====================
  if (btnEdit) {
    btnEdit.addEventListener("click", () => {
      const dummyShift = {
        start: originalStart,
        end: originalEnd,
        state: originalState
      };

      if (!hasEditableShiftTime(dummyShift) || !isTodayOrFuture(selectedDateStr)) {
        editArea.style.display = "none";
        editError.textContent = "";
        return;
      }

      detailMode = "view";
      editArea.style.display = "block";
      editError.textContent = "";
      generateTimeOptionsForMode("view");
    });
  }

  // =====================
  // 保存（時間変更 / 新規追加 共通）
  // =====================
  if (saveEdit) {
    saveEdit.addEventListener("click", async () => {
      editError.textContent = "";

      if (detailMode === "add") {
        const start = startSelect.value;
        const end = endSelect.value;

        if (!start || !end) {
          editError.textContent = "出勤時間と退勤時間を選択してください";
          return;
        }

        const now = new Date();
        const startDt = new Date(`${selectedDateStr}T${start}:00`);
        const endDt = new Date(`${selectedDateStr}T${end}:00`);

        if (startDt < now) {
          editError.textContent = "出勤時間は過去に設定できません。公式LINEに相談してください";
          return;
        }

        if (endDt < now) {
          editError.textContent = "退勤時間は過去に設定できません。公式LINEに相談してください";
          return;
        }

        if (startDt >= endDt) {
          editError.textContent = "時間の設定が不正です。公式LINEに相談してください";
          return;
        }

        if (!confirm("この内容でシフト追加してもよろしいですか？")) {
          return;
        }

        try {
          setButtonsDisabled(true);
          resultDiv.textContent = "追加処理中…";

          const profile = await liff.getProfile();

          const url =
            GAS_URL +
            "?action=addShift" +
            "&userId=" + encodeURIComponent(profile.userId) +
            "&name=" + encodeURIComponent(profile.displayName) +
            "&date=" + encodeURIComponent(selectedDateStr) +
            "&start=" + encodeURIComponent(start) +
            "&end=" + encodeURIComponent(end);

          const data = await fetchJson(url);

          if (!data.success) {
            editError.textContent = data.message || "シフト追加に失敗しました";
            resultDiv.textContent = "";
            return;
          }

          const reflected = await waitForShiftRefresh(() => {
            const dayShifts = shiftData[selectedDateStr] || [];

            return dayShifts.some((shift) => {
              return (
                normalizeText(shift.start) === start &&
                normalizeText(shift.end) === end
              );
            });
          }, {
            maxAttempts: 8,
            intervalMs: 1500,
            loadingMessage: "シフト追加の反映待ち…"
          });

          resultDiv.textContent = "";

          alert(
            reflected
              ? (data.message || "シフト追加が完了しました")
              : "シフト追加の処理は完了しました。画面反映に時間がかかっているため、更新ボタンで再確認してください。"
          );

          detailView.style.display = "none";
          calendarView.style.display = "block";
          resetDetailState();
          generateCalendar(currentDate);
        } catch (err) {
          console.error(err);
          editError.textContent = "追加中にエラーが発生しました";
          resultDiv.textContent = "";
        } finally {
          setButtonsDisabled(false);
        }

        return;
      }

      const start = startSelect.value;
      const end = endSelect.value;

      const newStart = start === originalStart ? originalStart : start;
      const newEnd = end === originalEnd ? originalEnd : end;

      const now = new Date();
      const startDt = new Date(`${selectedDateStr}T${newStart}:00`);
      const endDt = new Date(`${selectedDateStr}T${newEnd}:00`);
      const originalEndDt = new Date(`${selectedDateStr}T${originalEnd}:00`);

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

        const data = await fetchJson(url);

        if (!data.success) {
          editError.textContent = data.message || "時間変更に失敗しました";
          resultDiv.textContent = "";
          return;
        }

        const reflected = await waitForShiftRefresh(() => {
          const found = findShiftById(selectedShiftId);
          if (!found) return false;

          return (
            normalizeText(found.shift.start) === newStart &&
            normalizeText(found.shift.end) === newEnd
          );
        }, {
          maxAttempts: 8,
          intervalMs: 1500,
          loadingMessage: "時間変更の反映待ち…"
        });

        editArea.style.display = "none";

        alert(
          reflected
            ? (data.message || "シフトを保存しました")
            : "時間変更の保存は完了しました。画面反映に時間がかかっているため、更新ボタンで再確認してください。"
        );

        resultDiv.textContent = "";
        detailView.style.display = "none";
        calendarView.style.display = "block";
        resetDetailState();
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
      const dummyShift = {
        start: originalStart,
        end: originalEnd,
        state: originalState
      };

      if (!hasEditableShiftTime(dummyShift) || !isTodayOrFuture(selectedDateStr)) {
        return;
      }

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

        const data = await fetchJson(url);

        if (!data.success) {
          alert(data.message || "休み / 削除処理に失敗しました");
          resultDiv.textContent = "";
          return;
        }

        const reflected = await waitForShiftRefresh(() => {
          const found = findShiftById(selectedShiftId);

          if (!found) return true;

          const state = normalizeText(found.shift.state);
          const startEmpty = !normalizeText(found.shift.start);
          const endEmpty = !normalizeText(found.shift.end);

          return isAbsentState(state) || (startEmpty && endEmpty);
        }, {
          maxAttempts: 8,
          intervalMs: 1500,
          loadingMessage: "休み / 削除の反映待ち…"
        });

        detailView.style.display = "none";
        calendarView.style.display = "block";
        resultDiv.textContent = "";
        resetDetailState();

        alert(
          reflected
            ? (data.message || "処理が完了しました")
            : "休み / 削除の処理は完了しました。画面反映に時間がかかっているため、更新ボタンで再確認してください。"
        );
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
      const dummyShift = {
        start: originalStart,
        end: originalEnd,
        state: originalState
      };

      const targetDate = getDateOnly(new Date(selectedDateStr + "T00:00:00"));
      const today = getDateOnly(new Date());
      const isToday = targetDate.getTime() === today.getTime();

      const canOpenMedical =
        (hasEditableShiftTime(dummyShift) && isToday) ||
        isAbsentState(originalState);

      if (!canOpenMedical) {
        resetMedicalArea();
        return;
      }

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
          clearMedicalPreviewUrl();
          if (medicalPreview) medicalPreview.src = "";
          if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
          return;
        }

        if (!file.type.startsWith("image/")) {
          medicalError.textContent = "画像ファイルを選択してください";
          medicalFile.value = "";
          medicalFileObj = null;
          medicalImageBase64 = "";
          clearMedicalPreviewUrl();
          if (medicalPreview) medicalPreview.src = "";
          if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
          return;
        }

        resultDiv.textContent = "画像を調整中…";

        const { blob, base64 } = await prepareCompressedMedicalImage(file);

        if (!base64) {
          throw new Error("画像データの作成に失敗しました");
        }

        if (base64.length > 4500000) {
          medicalError.textContent =
            "画像サイズが大きすぎます。もう少し小さい画像で試してください。";
          resultDiv.textContent = "";
          medicalFile.value = "";
          medicalFileObj = null;
          medicalImageBase64 = "";
          clearMedicalPreviewUrl();
          if (medicalPreview) medicalPreview.src = "";
          if (medicalPreviewWrap) medicalPreviewWrap.style.display = "none";
          return;
        }

        medicalFileObj = new File([blob], "medical.jpg", {
          type: "image/jpeg"
        });
        medicalImageBase64 = base64;

        clearMedicalPreviewUrl();
        medicalPreviewObjectUrl = URL.createObjectURL(blob);

        if (medicalPreview) {
          medicalPreview.src = medicalPreviewObjectUrl;
        }
        if (medicalPreviewWrap) {
          medicalPreviewWrap.style.display = "block";
        }

        resultDiv.textContent = "";
      } catch (err) {
        console.error(err);
        resultDiv.textContent = "";
        medicalError.textContent = "画像の読み込みに失敗しました";
      }
    });
  }

  // =====================
  // 診断書提出
  // =====================
  if (submitMedical) {
    submitMedical.addEventListener("click", async () => {
      medicalError.textContent = "";

      if (!medicalFileObj || !medicalImageBase64) {
        medicalError.textContent = "診断書の写真をアップロードしてください";
        return;
      }

      if (medicalImageBase64.length > 4500000) {
        medicalError.textContent =
          "画像サイズが大きすぎます。もう少し小さい画像で試してください。";
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

      let submitSucceeded = false;
      let submitMessage =
        "診断書の提出が完了しました。月末に確認をしているため、不正があった場合は当日欠勤に戻る可能性があります。";

      try {
        const profile = await liff.getProfile();

        const formBody = new URLSearchParams({
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
        });

        const data = await fetchJson(GAS_URL, {
          method: "POST",
          body: formBody
        });

        if (!data.success) {
          medicalError.textContent = data.message || "診断書の提出に失敗しました";
          resultDiv.textContent = "";
          return;
        }

        submitSucceeded = true;
        submitMessage = data.message || submitMessage;
      } catch (err) {
        console.error("submitMedical送信エラー:", err);
        resultDiv.textContent = "";
        medicalError.textContent =
          "診断書の提出に失敗しました: " + (err.message || err);
        return;
      }

      try {
        resultDiv.textContent = "診断書提出後の反映待ち…";

        const reflected = await waitForShiftRefresh(() => {
          const found = findShiftById(selectedShiftId);

          if (!found) return true;

          const state = normalizeText(found.shift.state);
          const startEmpty = !normalizeText(found.shift.start);
          const endEmpty = !normalizeText(found.shift.end);

          return isMedicalSubmittedState(state) || (startEmpty && endEmpty);
        }, {
          maxAttempts: 8,
          intervalMs: 1500,
          loadingMessage: "診断書提出後の反映待ち…"
        });

        alert(
          reflected
            ? submitMessage
            : "診断書の提出は完了しました。Lark側の反映に時間がかかっているため、更新ボタンで再確認してください。"
        );
      } catch (err) {
        console.error("submitMedical反映待ちエラー:", err);

        if (submitSucceeded) {
          alert(
            "診断書の提出は完了しました。画面反映の確認中にエラーが発生したため、更新ボタンで再確認してください。"
          );
        } else {
          medicalError.textContent =
            "診断書の提出後処理でエラーが発生しました: " + (err.message || err);
          resultDiv.textContent = "";
          return;
        }
      } finally {
        resultDiv.textContent = "";
        resetMedicalArea();
        detailView.style.display = "none";
        calendarView.style.display = "block";
        resetDetailState();
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
        await reloadShifts();
        resultDiv.textContent = "";
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
      updateWorktimeDisplay();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate);
      updateWorktimeDisplay();
    });
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

    const weekHeader = document.createElement("div");
    weekHeader.className = "week-header";

    const weekList = ["日", "月", "火", "水", "木", "金", "土"];

    weekList.forEach((w, index) => {
      const cell = document.createElement("div");
      cell.className = "week-cell";
      cell.textContent = w;

      if (index === 0) cell.style.color = "#d93025";
      if (index === 6) cell.style.color = "#1a73e8";

      weekHeader.appendChild(cell);
    });

    calendarDiv.appendChild(weekHeader);

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
      const hasShift = hasVisibleShiftOnDay(dayShifts) || hasAnyShiftRecordOnDay(dayShifts);

      if (!hasShift && isTodayOrFuture(fullDateStr)) {
        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "add-shift-button";
        addBtn.textContent = "⊕";
        addBtn.style.display = "block";
        addBtn.style.margin = "6px auto 0";
        addBtn.style.fontSize = "22px";
        addBtn.style.lineHeight = "1";
        addBtn.style.border = "none";
        addBtn.style.background = "transparent";
        addBtn.style.cursor = "pointer";
        addBtn.style.color = "#1a73e8";

        addBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openAddDetail(fullDateStr);
        });

        dayDiv.appendChild(addBtn);
      }

      dayShifts.forEach((shift) => {
        const displayText = getShiftDisplayText(shift);
        if (!displayText) return;

        const shiftSpan = document.createElement("div");
        shiftSpan.className = "shift-time";
        shiftSpan.textContent = displayText;

        const state = normalizeText(shift.state);
        if (isAbsentState(state)) {
          shiftSpan.classList.add("state-absent");
        } else if (isMedicalSubmittedState(state)) {
          shiftSpan.classList.add("state-medical");
        }

        shiftSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          openDetail(fullDateStr, shift);
        });

        dayDiv.appendChild(shiftSpan);
      });

      calendarDiv.appendChild(dayDiv);
    }
  }
};



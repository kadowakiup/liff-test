// window.onload = async function () {
//   const button = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");

//   // LIFF初期化
//   try {
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });
//   } catch (err) {
//     console.error(err);
//     resultDiv.textContent = "LIFF初期化エラー";
//     return;
//   }

//   // ボタン押下処理
//   button.addEventListener("click", async () => {
//     try {
//       // ログインチェック
//       if (!liff.isLoggedIn()) {
//         // ログイン後、元のページに戻る
//         liff.login();
//         return;
//       }

//       // プロフィール取得
//       const profile = await liff.getProfile();
//       const payload = {
//         userId: profile.userId,
//         name: profile.displayName
//       };

//       // GASにPOST
//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbzGPx2dqhDxn4bGv_AgVJv1K1om_SKKzvLpDBwNxIzLTzNci81wVaxSx8MU6Pg9qS7pfA/exec",
//         {
//           method: "POST",
//           contentType: "application/json",
//           body: JSON.stringify(payload)
//         }
//       );

//       if (!response.ok) {
//         throw new Error("GASへのリクエスト失敗: " + response.status);
//       }

//       const data = await response.json();
//       resultDiv.textContent = "合計稼働時間: " + (data.total ?? 0);

//     } catch (err) {
//       console.error(err);
//       resultDiv.textContent = "エラー: " + err.message;
//       alert("エラーが発生しました: " + err.message); // スマホでも確認できるように
//     }
//   });
// };



// カレンダー表示のみ
// window.onload = async function () {
//   const calendarDiv = document.getElementById("calendar");
//   const currentMonthSpan = document.getElementById("currentMonth");
//   const updateButton = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");
//   const firstMessageDiv = document.getElementById("firstMessage");
//   const monthNavDiv = document.getElementById("monthNav");
//   const prevMonthBtn = document.getElementById("prevMonth");
//   const nextMonthBtn = document.getElementById("nextMonth");

//   // LIFFを開いた日を基準
//   const today = new Date();
//   let currentDate = new Date(today); // 表示中の月

//   // 仮データ（実際はGASから取得）
//   let shiftData = {
//     "2026-03-01": "9:00-17:00",
//     "2026-03-02": "10:00-18:00",
//     "2026-03-04": "9:30-17:30",
//     "2026-03-07": "11:00-19:00",
//   };

//   // カレンダー生成
//   function generateCalendar(date) {
//     calendarDiv.innerHTML = "";

//     const year = date.getFullYear();
//     const month = date.getMonth(); // 0~11
//     currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const totalDays = lastDay.getDate();

//     const startDay = firstDay.getDay(); // 0=日曜

//     // 曜日位置の空セル
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

//       if (shiftData[fullDateStr]) {
//         const shiftSpan = document.createElement("div");
//         shiftSpan.className = "shift-time";
//         shiftSpan.textContent = shiftData[fullDateStr];
//         dayDiv.appendChild(shiftSpan);
//       }

//       calendarDiv.appendChild(dayDiv);
//     }
//   }

//   // 前後月ボタンの有効/無効を設定
//   function updateMonthButtons() {
//     const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
//     const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

//     // 前月は today の前月より前には戻せない
//     prevMonthBtn.disabled = prevMonth < new Date(today.getFullYear(), today.getMonth() - 1);

//     // 翌月は today の翌月より後には進めない
//     nextMonthBtn.disabled = nextMonth > new Date(today.getFullYear(), today.getMonth() + 1);
//   }

//   // 更新ボタン押下
//   updateButton.addEventListener("click", async () => {
//     resultDiv.textContent = "更新中…";

//     try {
//       // 💡 実際はここで fetch → GAS → Anycross → JSON を取得して shiftData に反映
//       // await fetchGAS();

//       // データ取得完了
//       firstMessageDiv.style.display = "none"; // 更新ボタン非表示
//       monthNavDiv.style.display = "flex";     // 月ナビ表示
//       resultDiv.textContent = "";

//       generateCalendar(currentDate);          // カレンダー生成
//       updateMonthButtons();                   // ボタン状態更新
//     } catch (err) {
//       console.error(err);
//       resultDiv.textContent = "取得エラー: " + err.message;
//     }
//   });

//   // 前月ボタン
//   prevMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() - 1);
//     generateCalendar(currentDate);
//     updateMonthButtons();
//   });

//   // 翌月ボタン
//   nextMonthBtn.addEventListener("click", () => {
//     currentDate.setMonth(currentDate.getMonth() + 1);
//     generateCalendar(currentDate);
//     updateMonthButtons();
//   });
// };




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

  // 🔹 ここでLIFF初期化！
  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" }); // ←あなたのLIFF IDに置き換え
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "LIFF初期化エラー: " + err.message;
    return;
  }

  // LIFFを開いた日を基準
  const today = new Date();
  let currentDate = new Date(today); // 表示中の月

  // shiftData 初期化（GASから取得後に置換）
  let shiftData = {};

  function generateCalendar(date) {
    calendarDiv.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth(); // 0~11
    currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startDay = firstDay.getDay();

    // 空セル
    for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "day";
      calendarDiv.appendChild(emptyDiv);
    }

    // 日付セル
    for (let day = 1; day <= totalDays; day++) {
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
        dayDiv.appendChild(shiftSpan);
      }

      calendarDiv.appendChild(dayDiv);
    }
  }

  // ボタン押下でGAS経由でシフトデータ取得
  updateButton.addEventListener("click", async () => {
    resultDiv.textContent = "更新中…";

    try {
      // ログインチェック
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      // プロフィール取得
      const profile = await liff.getProfile();
      const payload = { userId: profile.userId, name: profile.displayName };

      // GASにPOSTしてAnycrossデータ取得
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwNi1gTg9is9-NpP51wAhH2qocLhCmdxDxc1fJSpodsWapo2-25oldV3RetjbxWMIey0A/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("GASへのリクエスト失敗: " + response.status);

      const data = await response.json();
      // 取得データを shiftData に変換
      // ここでは仮に「data.shifts」に { "2026-03-01": "9:00-17:00", ... } が入ってくる想定
      shiftData = data.shifts || {};

      // 更新ボタン非表示、カレンダー表示
      firstMessageDiv.style.display = "none";
      monthNavDiv.style.display = "flex";
      resultDiv.textContent = "";

      generateCalendar(currentDate);
      updateMonthButtons();

    } catch (err) {
      console.error(err);
      resultDiv.textContent = "取得エラー: " + err.message;
      alert("エラーが発生しました: " + err.message);
    }
  });

  // 前後月ボタン制限
  function updateMonthButtons() {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

    prevMonthBtn.disabled = prevMonth < new Date(today.getFullYear(), today.getMonth() - 1);
    nextMonthBtn.disabled = nextMonth > new Date(today.getFullYear(), today.getMonth() + 1);
  }

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
    updateMonthButtons();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
    updateMonthButtons();
  });

};
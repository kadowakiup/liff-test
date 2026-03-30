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



window.onload = async function () {
  const calendarDiv = document.getElementById("calendar");
  const currentMonthSpan = document.getElementById("currentMonth");
  const updateButton = document.getElementById("updateButton");
  const resultDiv = document.getElementById("result");
  const firstMessageDiv = document.getElementById("firstMessage");
  const monthNavDiv = document.getElementById("monthNav");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  // 現在日付
  let currentDate = new Date();

  // 仮データ（実際はGASから取得）
  let shiftData = {
    "2026-03-01": "9:00-17:00",
    "2026-03-02": "10:00-18:00",
    "2026-03-04": "9:30-17:30",
    "2026-03-07": "11:00-19:00",
  };

  // カレンダー生成
  function generateCalendar(date) {
    calendarDiv.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth(); // 0~11
    currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const startDay = firstDay.getDay(); // 0=日曜

    // 空セル
    for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "day";
      calendarDiv.appendChild(emptyDiv);
    }

    // 日付セル
    for (let day = 1; day <= totalDays; day++) {
      const fullDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
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

  // 更新ボタン押下
  updateButton.addEventListener("click", async () => {
    // 更新中表示
    resultDiv.textContent = "更新中…";

    try {
      // 💡 実際はここで fetch → GAS → Anycross → JSON を取得
      // await fetchGAS();

      // データ取得完了
      firstMessageDiv.style.display = "none"; // 更新ボタン非表示
      monthNavDiv.style.display = "flex";     // 月ナビ表示
      resultDiv.textContent = "";             // 更新中消す

      generateCalendar(currentDate);          // カレンダー生成

    } catch (err) {
      console.error(err);
      resultDiv.textContent = "取得エラー: " + err.message;
    }
  });

  // 前月ボタン
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
  });

  // 翌月ボタン
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
  });
};
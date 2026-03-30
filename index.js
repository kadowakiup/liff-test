// window.onload = async function () {
//   try {
//     // LIFF初期化
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });

//     // 未ログインならログイン
//     if (!liff.isLoggedIn()) {
//       liff.login();
//       return;
//     }

//     const updateButton = document.getElementById("updateButton");
//     const resultDiv = document.getElementById("result");

//     // ボタン押下でAnycrossに送信
//     updateButton.addEventListener("click", async () => {
//       try {
//         const profile = await liff.getProfile();

//         const payload = {
//           userId: profile.userId,
//           name: profile.displayName
//         };

//         // GASにPOST（CORS回避済みシンプルリクエスト）
//         await fetch("https://script.google.com/macros/s/AKfycbzAGBQWSpYAnYB-EMpsYkAnrfQ12IYOLr7EsLH7ktcPlnLVRjWdjyKwwkYDX8DL9qRDzw/exec", {
//           method: "POST",
//           body: JSON.stringify(payload)
//         });

//         console.log("送信完了:", payload);
//         resultDiv.textContent = "送信完了しました！";

//       } catch (err) {
//         console.error("送信エラー:", err);
//         resultDiv.textContent = "送信に失敗しました: " + err.message;
//       }
//     });

//   } catch (err) {
//     console.error("LIFF初期化エラー:", err);
//     document.getElementById("result").textContent = "LIFF初期化に失敗しました: " + err.message;
//   }
// };




// window.onload = async function () {
//   try {
//     await liff.init({ liffId: "2009569390-ToBfmkCN" });

//     if (!liff.isLoggedIn()) {
//       liff.login();
//       return;
//     }

//     const button = document.getElementById("updateButton");
//     const resultDiv = document.getElementById("result");

//     button.addEventListener("click", async () => {
//       try {
//         const profile = await liff.getProfile();

//         const payload = {
//           userId: profile.userId,
//           name: profile.displayName
//         };

//         console.log("送信payload:", payload);

//         const response = await fetch(
//           "https://script.google.com/macros/s/AKfycbzGPx2dqhDxn4bGv_AgVJv1K1om_SKKzvLpDBwNxIzLTzNci81wVaxSx8MU6Pg9qS7pfA/exec",
//           {
//             method: "POST",
//             body: JSON.stringify(payload)
//           }
//         );

//         // 👇 ステータス確認
//         console.log("HTTPステータス:", response.status);

//         // 👇 生テキスト取得（これ重要）
//         const rawText = await response.text();
//         console.log("生レスポンス:", rawText);

//         // 👇 JSON変換
//         let data;
//         try {
//           data = JSON.parse(rawText);
//         } catch (e) {
//           console.error("JSONパース失敗:", e);
//           resultDiv.textContent = "JSONパースエラー";
//           return;
//         }

//         console.log("JSON変換後:", data);

//         // 👇 total確認
//         console.log("totalの中身:", data.total);

//         resultDiv.textContent = "合計稼働時間: " + data.total;

//       } catch (err) {
//         console.error("通信エラー:", err);
//         resultDiv.textContent = "エラー: " + err.message;
//       }
//     });

//   } catch (err) {
//     console.error("LIFF初期化エラー:", err);
//     document.getElementById("result").textContent = "LIFF初期化エラー";
//   }
// };



// window.onload = async function () {
//   await liff.init({ liffId: "2009569390-ToBfmkCN" });

//   if (!liff.isLoggedIn()) {
//     liff.login();
//     return;
//   }

//   const button = document.getElementById("updateButton");
//   const resultDiv = document.getElementById("result");

//   button.addEventListener("click", async () => {
//     try {
//       const profile = await liff.getProfile();

//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbzGPx2dqhDxn4bGv_AgVJv1K1om_SKKzvLpDBwNxIzLTzNci81wVaxSx8MU6Pg9qS7pfA/exec",
//         {
//           method: "POST",
//           body: JSON.stringify({
//             userId: profile.userId,
//             name: profile.displayName
//           })
//         }
//       );

//       const data = await response.json();

//       resultDiv.textContent = "合計稼働時間: " + (data.total ?? 0);

//     } catch (err) {
//       resultDiv.textContent = "エラーが発生しました";
//       console.error(err);
//     }
//   });
// };





window.onload = async function () {
  try {
    await liff.init({ liffId: "2009569390-ToBfmkCN" });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const button = document.getElementById("updateButton");
    const resultDiv = document.getElementById("result");

    button.addEventListener("click", async () => {
      try {
        const profile = await liff.getProfile();

        const payload = {
          userId: profile.userId,
          name: profile.displayName
        };

        // 🔥 ここが重要（headersなし）
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzGPx2dqhDxn4bGv_AgVJv1K1om_SKKzvLpDBwNxIzLTzNci81wVaxSx8MU6Pg9qS7pfA/exec",
          {
            method: "POST",
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();

        resultDiv.textContent = "合計稼働時間: " + (data.total || 0);

      } catch (err) {
        console.error(err);
        resultDiv.textContent = "エラー: " + err.message;
      }
    });

  } catch (err) {
    console.error(err);
    document.getElementById("result").textContent = "LIFF初期化エラー";
  }
};
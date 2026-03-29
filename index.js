// const LIFF_ID = "2009569390-ToBfmkCN";
// console.log(LIFF_ID);
// async function main() {
//     await liff.init({ liffId: LIFF_ID });
// }
// main();
// async function send() {
//     const date = document.getElementById("date").value;
//     const profile = await liff.getProfile();
//     await fetch("https://open-jp.larksuite.com/anycross/trigger/callback/YjBhMmRhN2ZjNTFmMDY4MzAzMzY5NDMzMDlhZjlhNzQw", {
//         method: "POST",
//         headers: {
//             "Content-Type":"application/json"
//         },
//         body: JSON.stringify({
//             userId: profile.userId,
//             date: date
//         })
//     });
//     alert("送信しました");
// }


// const LIFF_ID = "2009569390-ToBfmkCN";
// async function main() {
//     await liff.init({ liffId: LIFF_ID });

//     if (!liff.isLoggedIn()) {
//         liff.login();
//         return;
//     }
// }
// main();

// async function send() {
//     const date = document.getElementById("date").value;
//     console.log("inClient:", liff.isInClient());
//     if (!liff.isInClient()) {
//         alert("LINEアプリ内で開いてください");
//         return;
//     }
//     await liff.sendMessages([
//         {
//             type: "text",
//             text: "シフト変更＞" + date
//         }
//     ]);
//     alert("送信しました");
//     liff.closeWindow();
// }


window.onload = function () {
  liff.init({
    liffId: "2009569390-ToBfmkCN"
  })
  .then(() => {
    console.log("LIFF初期化成功");
  })
  .catch((err) => {
    console.error("LIFF初期化エラー:", err);
  });
};

function send() {
  // LIFFが開かれているかチェック
  if (!liff.isInClient()) {
    alert("LINEアプリ内で開いてください");
    return;
  }

  liff.sendMessages([
    {
      type: "text",
      text: "テスト"
    }
  ])
  .then(() => {
    alert("送信しました");
    liff.closeWindow(); // 送信後に画面閉じる
  })
  .catch((err) => {
    console.error("送信エラー:", err);
    alert("送信に失敗しました");
  });
}
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


// Larkデータ取得テスト
window.onload = async function () {
  await liff.init({ liffId: "2009569390-ToBfmkCN" });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  const userId = profile.userId;

  console.log("fetch前");
  // 👉 AnyCrossにリクエスト送る
//   fetch("https://open-jp.larksuite.com/anycross/trigger/callback/NWE5ZDg4YTJmOTg2MGIyODJkYzAyZGZkMDgzMDA2OWYw", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       userId: userId
//     })
//   })
fetch("https://script.google.com/macros/s/AKfycbz0Sv4xWnHyRsioN752Zz2ISigXwmVlMXpxRnWXmI8RZvre3szuLLqUBPK5s3Fypgt9ig/exec", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    userId: userId
  })
})


  .then(res => res.json())
  .then(data => {
      document.getElementById("result").innerText = data.total;
  })
  .catch(err => {
      console.error(err);
  });
};
// liff.init({ liffId: "2009569390-ToBfmkCN" })
// .then(() => {
//     if (!liff.isLoggedIn()) {
//         liff.login();
//     } else {
//         document.getElementById('title').textContent = 'ログイン済み';
//     }
// })

// // const express = require('express');
// // const app = express();

// // app.get('/', (req, res) => {
// //   res.send('サーバー動いてるよ！');
// // });

// // app.listen(3000, () => {
// //   console.log('http://localhost:3000');
// // });

const LIFF_ID = "2009569390-ToBfmkCN";
console.log(LIFF_ID);
async function main() {
    await liff.init({ liffId: LIFF_ID });
}
main();
async function send() {
    const date = document.getElementById("date").value;
    const profile = await liff.getProfile();
    await fetch("https://open-jp.larksuite.com/anycross/trigger/callback/YjBhMmRhN2ZjNTFmMDY4MzAzMzY5NDMzMDlhZjlhNzQw", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            userId: profile.userId,
            date: date
        })
    });
    alert("送信しました");
}
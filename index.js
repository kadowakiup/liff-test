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

const LIFF_ID = "2009569390-ToBfmkCN";

async function main() {
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }
}

main();

async function send() {

    const date = document.getElementById("date").value;

    await liff.sendMessages([
        {
            type: "text",
            text: "シフト変更＞" + date
        }
    ]);

    alert("送信しました");

    liff.closeWindow();

}
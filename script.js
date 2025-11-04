// ===== Firebaseの設定 =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider,
         signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 👇ここに自分のFirebase設定をコピペ
const firebaseConfig = {
  apiKey: "AIzaSyAhzyGSVtxvd3DeReR13iVybxAbx8W8vrg",
  authDomain: "point-3d4a0.firebaseapp.com",
  projectId: "point-3d4a0",
  storageBucket: "point-3d4a0.firebasestorage.app",
  messagingSenderId: "920865912707",
  appId: "1:920865912707:web:608ea8cc097247f3d728b6"
};

// ===== Firebase初期化 =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== ログイン処理 =====
const googleLoginBtn = document.getElementById("google-login");
const emailLoginBtn = document.getElementById("email-login");

if (googleLoginBtn) {
  googleLoginBtn.onclick = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
}

if (emailLoginBtn) {
  emailLoginBtn.onclick = async () => {
    const email = prompt("メールアドレス:");
    const pass = prompt("パスワード:");
    await signInWithEmailAndPassword(auth, email, pass);
  };
}

// ===== ユーザー画面 =====
onAuthStateChanged(auth, async user => {
  if (!user) return;

  document.getElementById("login-area").style.display = "none";
  const main = document.getElementById("main");
  if (main) main.style.display = "block";

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { points: 0 });
  }

  async function updatePointsDisplay() {
    const data = (await getDoc(userRef)).data();
    document.getElementById("points").innerText = data.points;
  }
  await updatePointsDisplay();

  // 広告を見るボタン
  const adBtn = document.getElementById("watch-ad");
  if (adBtn) {
    adBtn.onclick = async () => {
      alert("ca-app-pub-9504316266132870/3784897026");
      await updateDoc(userRef, { points: (await getDoc(userRef)).data().points + 200 });
      await updatePointsDisplay();
    };
  }

  // 交換ボタン
  const exBtn = document.getElementById("exchange");
  if (exBtn) {
    exBtn.onclick = async () => {
      const adminDoc = await getDoc(doc(db, "admin", "config"));
      const url = adminDoc.exists() ? adminDoc.data().giftURL : "";
      if (url) window.open(url, "_blank");
      else alert("ギフトURLが設定されていません。");
    };
  }
});

// ===== 管理者ページ =====
const saveBtn = document.getElementById("save-url");
if (saveBtn) {
  saveBtn.onclick = async () => {
    const url = document.getElementById("gift-url").value;
    await setDoc(doc(db, "admin", "config"), { giftURL: url });
    document.getElementById("saved-msg").innerText = "保存しました✅";
  };
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    // 🔥 Firebase config — board.html과 동일하게 입력
    const firebaseConfig = {
apiKey: "AIzaSyBByCMlfqAZMzSOYlvEGm7Rd6aXXeByjwY",
  authDomain: "terminal-2340c.firebaseapp.com",
  databaseURL: "https://terminal-2340c-default-rtdb.firebaseio.com",
  projectId: "terminal-2340c",
  storageBucket: "terminal-2340c.firebasestorage.app",
  messagingSenderId: "611432501438",
  appId: "1:611432501438:web:43e3d7e5e2279bf3338eef",
  measurementId: "G-WSE9YE9D5W"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // 이미 로그인 상태면 게시판으로 이동
    onAuthStateChanged(auth, user => {
      if (user) window.location.href = "./board.html";
    });

    // 탭 전환
    window.switchTab = function(tab) {
      const tabs = document.querySelectorAll(".auth-tab");
      tabs.forEach((t, i) => t.classList.toggle("active", (i === 0) === (tab === "login")));
      document.getElementById("loginForm").classList.toggle("hidden", tab !== "login");
      document.getElementById("signupForm").classList.toggle("hidden", tab !== "signup");
      document.getElementById("loginError").textContent = "";
      document.getElementById("signupError").textContent = "";
      document.getElementById("signupSuccess").textContent = "";
    };

    // 에러 메시지 한국어 변환
    function parseError(code) {
      const map = {
        "auth/user-not-found":       "존재하지 않는 이메일입니다.",
        "auth/wrong-password":       "비밀번호가 올바르지 않습니다.",
        "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
        "auth/invalid-email":        "이메일 형식이 올바르지 않습니다.",
        "auth/weak-password":        "비밀번호는 6자 이상이어야 합니다.",
        "auth/too-many-requests":    "요청이 너무 많습니다. 잠시 후 시도해주세요.",
        "auth/invalid-credential":   "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
      return map[code] || "오류가 발생했습니다. 다시 시도해주세요.";
    }

    // 로그인
    window.handleLogin = async function() {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const errEl = document.getElementById("loginError");
      const btn = document.getElementById("loginBtn");
      errEl.textContent = "";
      if (!email || !password) { errEl.textContent = "이메일과 비밀번호를 입력해주세요."; return; }
      btn.disabled = true; btn.textContent = "접속 중...";
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "./board.html";
      } catch(e) {
        errEl.textContent = parseError(e.code);
        btn.disabled = false; btn.textContent = "로그인";
      }
    };

    // 회원가입
    window.handleSignup = async function() {
      const email = document.getElementById("signupEmail").value.trim();
      const pw = document.getElementById("signupPassword").value;
      const pw2 = document.getElementById("signupPasswordConfirm").value;
      const errEl = document.getElementById("signupError");
      const sucEl = document.getElementById("signupSuccess");
      const btn = document.getElementById("signupBtn");
      errEl.textContent = ""; sucEl.textContent = "";
      if (!email || !pw || !pw2) { errEl.textContent = "모든 항목을 입력해주세요."; return; }
      if (pw !== pw2) { errEl.textContent = "비밀번호가 일치하지 않습니다."; return; }
      btn.disabled = true; btn.textContent = "처리 중...";
      try {
        await createUserWithEmailAndPassword(auth, email, pw);
        sucEl.textContent = "회원가입 완료! 게시판으로 이동합니다...";
        setTimeout(() => window.location.href = "./board.html", 1200);
      } catch(e) {
        errEl.textContent = parseError(e.code);
        btn.disabled = false; btn.textContent = "회원가입";
      }
    };

    // Enter 키 제출
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const loginHidden = document.getElementById("loginForm").classList.contains("hidden");
      if (!loginHidden) window.handleLogin();
      else window.handleSignup();
    });
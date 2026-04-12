import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 Firebase config — 동일하게 입력
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

// ✅ 글쓰기 허용 이메일 목록 — 여기에 추가/수정
const ALLOWED_EMAILS = [
  "sihu714@gmail.com",
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const postsCol = collection(db, "study_posts"); // 일반 게시판과 분리된 컬렉션

let posts = [];
let currentPost = null;
let editMode = false;
let currentUser = null;
let isAdmin = false;
const PER_PAGE = 10;
let currentPage = 1;

// ── AUTH ──────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = user ? ALLOWED_EMAILS.includes(user.email) : false;
  renderHeaderUser(user);
  renderAdminUI();
  loadPosts();
});

function renderHeaderUser(user) {
  const el = document.getElementById("headerUser");
  if (user) {
    el.innerHTML = `
      <span class="user-email">> ${user.email}</span>
      <button class="logout-btn" id="logoutBtn">로그아웃</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
      showToast("로그아웃 되었습니다.");
    });
  } else {
    el.innerHTML = `<a href="./login.html" class="login-link">로그인</a>`;
  }
}

function renderAdminUI() {
  // 글쓰기 버튼 — 관리자만
  document.getElementById("writeBtn").style.display = isAdmin ? "block" : "none";
  // 관리자 뱃지
  document.getElementById("adminBadge").style.display = isAdmin ? "inline" : "none";
  // 열람 전용 안내 — 비관리자에게만
  document.getElementById("readonlyNotice").style.display = !isAdmin ? "block" : "none";
}

// ── UTILS ─────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ko-KR", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
}

function escapeHtml(str = "") {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderTags(tags = []) {
  if (!tags.length) return "";
  return tags.map(t => `<span class="study-tag">${escapeHtml(t.trim())}</span>`).join("");
}

// ── LOAD POSTS ────────────────────────────────────────
async function loadPosts() {
  try {
    const q = query(postsCol, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderList();
  } catch(e) {
    document.getElementById("postList").innerHTML =
      `<div class="state-msg">🔥 Firebase 설정을 확인해주세요.<br><small style="color:#ff4444">${e.message}</small></div>`;
  }
}

function renderList() {
  const list = document.getElementById("postList");
  document.getElementById("postCount").textContent = `// ${posts.length} posts`;

  if (posts.length === 0) {
    list.innerHTML = `<div class="state-msg">아직 게시글이 없습니다.</div>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * PER_PAGE;
  const pagePosts = posts.slice(start, start + PER_PAGE);

  list.innerHTML = pagePosts.map(p => {
    const tags = p.tags || [];
    return `
    <div class="post-item" onclick="showDetail('${p.id}')">
      <div class="post-item-left">
        <div class="post-item-title">${escapeHtml(p.title)}</div>
        <div class="post-item-meta" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span>${formatDate(p.createdAt)}</span>
          ${renderTags(tags)}
        </div>
      </div>
      <div class="post-item-actions" onclick="event.stopPropagation()">
        ${isAdmin ? `
          <button class="btn btn-sm" onclick="openEditModalById('${p.id}')">수정</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteById('${p.id}')">삭제</button>
        ` : ""}
      </div>
    </div>`;
  }).join("");

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(posts.length / PER_PAGE);
  if (total <= 1) { document.getElementById("pagination").innerHTML = ""; return; }
  let html = "";
  for (let p = 1; p <= total; p++) {
    html += `<button class="page-btn ${p === currentPage ? "active" : ""}" onclick="goPage(${p})">${p}</button>`;
  }
  document.getElementById("pagination").innerHTML = html;
}

window.goPage = p => { currentPage = p; renderList(); };

// ── DETAIL ────────────────────────────────────────────
window.showDetail = function(id) {
  currentPost = posts.find(p => p.id === id);
  if (!currentPost) return;
  const tags = currentPost.tags || [];
  document.getElementById("detailTitle").textContent = currentPost.title;
  document.getElementById("detailMeta").innerHTML =
    `${formatDate(currentPost.createdAt)}&nbsp;&nbsp;${renderTags(tags)}`;
  document.getElementById("detailBody").textContent = currentPost.body;
  document.getElementById("detailActions").style.display = isAdmin ? "flex" : "none";
  document.getElementById("listView").style.display = "none";
  document.getElementById("detailView").style.display = "block";
};

window.showList = function() {
  currentPost = null;
  document.getElementById("detailView").style.display = "none";
  document.getElementById("listView").style.display = "block";
};

// ── WRITE MODAL ───────────────────────────────────────
window.openWriteModal = function() {
  if (!isAdmin) { showToast("글쓰기 권한이 없습니다."); return; }
  editMode = false;
  document.getElementById("modalTitle").textContent = "// 새 글 작성";
  document.getElementById("submitBtn").textContent = "작성";
  document.getElementById("postTitleInput").value = "";
  document.getElementById("postTagInput").value = "";
  document.getElementById("postBodyInput").value = "";
  document.getElementById("writeModal").classList.add("active");
  document.getElementById("postTitleInput").focus();
};

window.openEditModal = () => currentPost && openEditModalById(currentPost.id);

window.openEditModalById = function(id) {
  if (!isAdmin) { showToast("권한이 없습니다."); return; }
  const p = posts.find(x => x.id === id);
  if (!p) return;
  currentPost = p;
  editMode = true;
  document.getElementById("modalTitle").textContent = "// 글 수정";
  document.getElementById("submitBtn").textContent = "수정";
  document.getElementById("postTitleInput").value = p.title;
  document.getElementById("postTagInput").value = (p.tags || []).join(", ");
  document.getElementById("postBodyInput").value = p.body;
  document.getElementById("writeModal").classList.add("active");
  document.getElementById("postTitleInput").focus();
};

window.closeModal = () => document.getElementById("writeModal").classList.remove("active");

window.submitPost = async function() {
  if (!isAdmin) { showToast("권한이 없습니다."); return; }
  const title = document.getElementById("postTitleInput").value.trim();
  const body  = document.getElementById("postBodyInput").value.trim();
  const tags  = document.getElementById("postTagInput").value
                  .split(",").map(t => t.trim()).filter(Boolean);
  if (!title) { showToast("제목을 입력해주세요."); return; }
  if (!body)  { showToast("내용을 입력해주세요."); return; }

  const btn = document.getElementById("submitBtn");
  btn.disabled = true; btn.textContent = "처리 중...";

  try {
    if (editMode && currentPost) {
      await updateDoc(doc(db, "study_posts", currentPost.id), { title, body, tags });
      showToast("수정되었습니다.");
      currentPost = { ...currentPost, title, body, tags };
      document.getElementById("detailTitle").textContent = title;
      document.getElementById("detailBody").textContent = body;
      document.getElementById("detailMeta").innerHTML =
        `${formatDate(currentPost.createdAt)}&nbsp;&nbsp;${renderTags(tags)}`;
    } else {
      await addDoc(postsCol, {
        title, body, tags,
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        userEmail: currentUser.email,
      });
      showToast("작성되었습니다.");
    }
    closeModal();
    await loadPosts();
  } catch(e) {
    showToast("오류: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editMode ? "수정" : "작성";
  }
};

// ── DELETE ────────────────────────────────────────────
window.confirmDelete = () => document.getElementById("confirmModal").classList.add("active");

window.confirmDeleteById = function(id) {
  currentPost = posts.find(p => p.id === id);
  document.getElementById("confirmModal").classList.add("active");
};

window.closeConfirm = () => document.getElementById("confirmModal").classList.remove("active");

window.deletePost = async function() {
  if (!isAdmin || !currentPost) return;
  try {
    await deleteDoc(doc(db, "study_posts", currentPost.id));
    showToast("삭제되었습니다.");
    closeConfirm();
    if (document.getElementById("detailView").style.display !== "none") showList();
    await loadPosts();
  } catch(e) {
    showToast("삭제 실패: " + e.message);
  }
};

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeConfirm(); }
});
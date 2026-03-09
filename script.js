// Login button click event with arrow function

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    username === "admin" && password === "admin123"
      ? (window.location.href = "main.html") // Login success
      : alert("Invalid username or password!"); // Login failed
  });
}

// সব ইস্যু ডাটা রাখার জন্য গ্লোবাল ভেরিয়েবল
let allIssues = [];

/**
 * ১. API থেকে সব ডাটা লোড করার ফাংশন
 */
async function loadIssues() {
  const loader = document.getElementById("loader");
  const container = document.getElementById("issue-container");

  // লোডার দেখানো এবং কন্টেইনার খালি করা
  loader.classList.remove("hidden");
  container.innerHTML = "";

  try {
    const res = await fetch(
      "https://phi-lab-server.vercel.app/api/v1/lab/issues",
    );
    const result = await res.json();

    // চেক করা হচ্ছে ডাটা কি সরাসরি অ্যারে নাকি অবজেক্টের ভেতর
    // যদি result.data থাকে তবে সেটা নিবে, নাহলে সরাসরি result নিবে
    allIssues = result.data || result;

    // যদি ডাটা না আসে তবে কনসোলে চেক করুন
    console.log("Fetched Data:", allIssues);

    if (Array.isArray(allIssues)) {
      displayIssues(allIssues);
    } else {
      container.innerHTML = `<p class='text-center col-span-4'>কোনো ডাটা পাওয়া যায়নি!</p>`;
    }
  } catch (error) {
    console.error("API Call Error:", error);
    container.innerHTML = `<p class='text-center col-span-4 text-red-500'>সার্ভার থেকে ডাটা আনতে সমস্যা হচ্ছে।</p>`;
  } finally {
    loader.classList.add("hidden");
  }
}

/**
 * ২. স্ক্রিনে কার্ডগুলো দেখানোর ফাংশন
 */
function displayIssues(issues) {
  const container = document.getElementById("issue-container");
  const issueCount = document.getElementById("issue-count");

  issueCount.innerText = `${issues.length} Issues`;

  if (issues.length === 0) {
    container.innerHTML = `<p class='text-center col-span-4'>এই ক্যাটাগরিতে কোনো ইস্যু নেই।</p>`;
    return;
  }

  container.innerHTML = issues
    .map((issue) => {
      // স্ট্যাটাস অনুযায়ী বর্ডার কালার
      const topBorder =
        issue.status?.toLowerCase() === "open"
          ? "border-t-green-500"
          : "border-t-purple-600";

      return `
        <div class="card bg-white border border-gray-200 border-t-4 ${topBorder} rounded-lg p-5 shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <span class="text-lg">⚙️</span>
                <span class="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded uppercase">
                    ${issue.priority || "Medium"}
                </span>
            </div>
            
            <h3 onclick="showDetails('${issue.id}')" class="font-bold text-sm mb-2 hover:text-blue-500 cursor-pointer transition-colors">
                ${issue.title}
            </h3>
            
            <p class="text-xs text-gray-500 line-clamp-2 mb-4">
                ${issue.description || "No description available."}
            </p>

            <div class="flex gap-2 mb-4">
                <span class="text-[9px] font-bold bg-red-100 text-red-500 px-2 py-1 rounded-full">${issue.category || "BUG"}</span>
                <span class="text-[9px] font-bold bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">HELP WANTED</span>
            </div>

            <div class="border-t pt-3 text-[10px] text-gray-400 flex justify-between">
                <span>#${issue.id} by ${issue.author || "User"}</span>
                <span>${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
        </div>
        `;
    })
    .join("");
}

// ৩. ফিল্টার ফাংশন (আগের মতোই থাকবে)
function filterIssues(status) {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => btn.classList.remove("btn-primary"));
  buttons.forEach((btn) => btn.classList.add("btn-ghost"));

  event.target.classList.replace("btn-ghost", "btn-primary");

  if (status === "all") {
    displayIssues(allIssues);
  } else {
    const filtered = allIssues.filter(
      (item) => item.status?.toLowerCase() === status,
    );
    displayIssues(filtered);
  }
}

// ৪. ডিটেইলস মোডাল
/**
 * ৪. মোডাল-এ ডিটেইলস দেখানোর আপডেট করা ফাংশন
 */
async function showDetails(id) {
  const modal = document.getElementById("issue_modal");
  const content = document.getElementById("modal-content");

  // লোডিং অবস্থায় মোডালটি খোলা
  content.innerHTML = `
        <div class="flex justify-center items-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
    `;
  modal.showModal();

  try {
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    );
    const result = await res.json();
    const data = result.data || result; // API ডাটা ফরম্যাট অনুযায়ী নেওয়া

    // আপনার ইমেজের ডিজাইন অনুযায়ী HTML স্ট্রাকচার
    content.innerHTML = `
            <h1 class="text-3xl font-bold text-gray-800 mb-4">${data.title}</h1>

            <div class="flex items-center gap-2 mb-6 text-gray-500 text-sm">                  
                <span>Opened by <strong>${data.author}</strong></span>
                <span>${new Date(data.createdAt).toLocaleDateString("en-GB")}</span>
            </div>

            <div class="flex gap-2 mb-8">
                <span class="flex items-center gap-1 border border-red-200 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                    🐞 BUG
                </span>
                <span class="flex items-center gap-1 border border-orange-200 text-orange-500 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold">
                    ⚙️ HELP WANTED
                </span>
            </div>

            <div class="text-gray-600 text-lg leading-relaxed mb-10">
                ${data.description}
            </div>

            <div class="grid grid-cols-2 bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                <div>
                    <p class="text-gray-400 text-sm mb-1">Assignee:</p>
                    <p class="font-bold text-lg text-gray-800">${data.author}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm mb-1">Priority:</p>
                    <span class="bg-red-500 text-white px-4 py-1 rounded-lg text-sm font-bold uppercase">
                        ${data.priority}
                    </span>
                </div>
            </div>
        `;

    // ক্লোজ বাটনটি মোডালের ডানে নিচে রাখার জন্য এই অংশটি
    const modalBox = document.querySelector(".modal-box");
    modalBox.className = "modal-box w-11/12 max-w-4xl p-10 rounded-2xl"; // মোডাল একটু বড় এবং সুন্দর করার জন্য
  } catch (error) {
    console.error("মোডাল ডাটা লোড এরর:", error);
    content.innerHTML = `<p class="text-center text-red-500 py-10">দুঃখিত, তথ্য লোড করা যায়নি।</p>`;
  }
}

// পেজ লোড হলে ফাংশনটি চালু হবে
loadIssues();

/**
 * সার্চ হ্যান্ডেল করার ফাংশন
 */
async function handleSearch() {
  const searchInput = document.getElementById("search-input");
  const searchText = searchInput.value.trim(); // ইনপুট থেকে টেক্সট নেওয়া
  const container = document.getElementById("issue-container");
  const loader = document.getElementById("loader");

  // যদি সার্চ বক্স খালি থাকে, তবে সব ডাটা আবার লোড করবে
  if (searchText === "") {
    loadIssues();
    return;
  }

  // লোডার দেখানো
  loader.classList.remove("hidden");
  container.innerHTML = "";

  try {
    // আপনার দেওয়া সার্চ API এন্ডপয়েন্ট কল করা
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`,
    );
    const result = await res.json();

    // ডাটা ফরম্যাট চেক (result.data অথবা সরাসরি result)
    const searchData = result.data || result;

    if (Array.isArray(searchData) && searchData.length > 0) {
      displayIssues(searchData); // পাওয়া গেলে স্ক্রিনে দেখানো
    } else {
      document.getElementById("issue-count").innerText = "0 Issues";
      container.innerHTML = `
                <div class="col-span-4 text-center py-20">
                    <p class="text-xl font-bold text-gray-400">দুঃখিত! "${searchText}" নামে কিছু পাওয়া যায়নি।</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("সার্চ করতে সমস্যা হয়েছে:", error);
  } finally {
    loader.classList.add("hidden");
  }
}

// ইনপুটে 'Enter' চাপলেও যেন সার্চ হয় তার জন্য এই কোড:
document
  .getElementById("search-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

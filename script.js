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


let allIssues = [];


async function loadIssues() {
  const loader = document.getElementById("loader");
  const container = document.getElementById("issue-container");

  
  loader.classList.remove("hidden");
  container.innerHTML = "";

  try {
    const res = await fetch(
      "https://phi-lab-server.vercel.app/api/v1/lab/issues",
    );
    const result = await res.json();

    allIssues = result.data || result;

   
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
  ${issue.labels
    .map((label) => {
      let colorClass = "bg-gray-100 text-gray-700"; 

      if (label.toLowerCase() === "bug") {
        colorClass = "bg-red-100 text-red-500";
      } else if (label.toLowerCase() === "help wanted") {
        colorClass = "bg-yellow-100 text-yellow-600";
      } else if (label.toLowerCase() === "enhancement") {
        colorClass = "bg-green-100 text-green-600";
      } else if (label.toLowerCase() === "documentation") {
        colorClass = "bg-blue-100 text-blue-600";
      } else if (label.toLowerCase() === "good first issue") {
        colorClass = "bg-purple-100 text-purple-600";
      }

      return `<span class="text-[9px] font-bold ${colorClass} px-2 py-1 rounded-full">${label.toUpperCase()}</span>`;
    })
    .join("")}
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


async function showDetails(id) {
  const modal = document.getElementById("issue_modal");
  const content = document.getElementById("modal-content");

  content.innerHTML = `
        <div class="flex justify-center items-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
    `;
  modal.showModal();

  try {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const result = await res.json();
    const data = result.data || result;

    const labelsHtml = data.labels && data.labels.length > 0 
      ? data.labels.map(label => {
          let colorClass = "bg-gray-100 text-gray-700 border-gray-200"; 

          const lowerLabel = label.toLowerCase();
          if (lowerLabel === "bug") {
            colorClass = "bg-red-100 text-red-500 border-red-200";
          } else if (lowerLabel === "help wanted") {
            colorClass = "bg-yellow-100 text-yellow-600 border-yellow-200";
          } else if (lowerLabel === "enhancement") {
            colorClass = "bg-green-100 text-green-600 border-green-200";
          } else if (lowerLabel === "documentation") {
            colorClass = "bg-blue-100 text-blue-600 border-blue-200";
          } else if (lowerLabel === "good first issue") {
            colorClass = "bg-purple-100 text-purple-600 border-purple-200";
          }

          return `
            <span class="flex items-center gap-1 border ${colorClass} px-3 py-1 rounded-full text-xs font-bold uppercase">
                ${label}
            </span>
          `;
        }).join('')
      : '<span class="text-gray-400 text-xs italic">No labels</span>';

    content.innerHTML = `
            <h1 class="text-3xl font-bold text-gray-800 mb-4">${data.title}</h1>

            <div class="flex items-center gap-2 mb-6 text-gray-500 text-sm">                  
                <span>Opened by <strong>${data.author}</strong></span>
                <span>${new Date(data.createdAt).toLocaleDateString("en-GB")}</span>
            </div>

            <div class="flex gap-2 mb-8">
                ${labelsHtml}
            </div>

            <div class="text-gray-600 text-lg leading-relaxed mb-10">
                ${data.description || "No description provided."}
            </div>

            <div class="grid grid-cols-2 bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                <div>
                    <p class="text-gray-400 text-sm mb-1">Assignee:</p>
                    <p class="font-bold text-lg text-gray-800">${data.author || "Unassigned"}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm mb-1">Priority:</p>
                    <span class="bg-red-500 text-white px-4 py-1 rounded-lg text-sm font-bold uppercase">
                        ${data.priority || "Medium"}
                    </span>
                </div>
            </div>
        `;

    const modalBox = document.querySelector(".modal-box");
    modalBox.className = "modal-box w-11/12 max-w-4xl p-10 rounded-2xl"; 
  } catch (error) {
    console.error("মোডাল ডাটা লোড এরর:", error);
    content.innerHTML = `<p class="text-center text-red-500 py-10">দুঃখিত, তথ্য লোড করা যায়নি।</p>`;
  }
}

loadIssues();


async function handleSearch() {
  const searchInput = document.getElementById("search-input");
  const searchText = searchInput.value.trim(); 
  const container = document.getElementById("issue-container");
  const loader = document.getElementById("loader");

  
  if (searchText === "") {
    loadIssues();
    return;
  }

  
  loader.classList.remove("hidden");
  container.innerHTML = "";

  try {
    
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`,
    );
    const result = await res.json();

  
    const searchData = result.data || result;

    if (Array.isArray(searchData) && searchData.length > 0) {
      displayIssues(searchData);
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


document
  .getElementById("search-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

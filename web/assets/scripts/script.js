// State Variables
let activeTab = "upload";
let selectedUploadFiles = [];
let selectedDownloadIds = new Set();
let transferInterval = null;
let currentPath = ["Shared Folder"];

// Nested Simulated Directory Structure
let fileSystem = {
    "Shared Folder": {
        type: "folder",
        items: [
            { id: "folder_1", name: "Work Projects", type: "folder", itemCount: 2, date: "Oct 01, 2026", icon: "folder" },
            { id: "folder_2", name: "Vacation Photos", type: "folder", itemCount: 2, date: "Sep 25, 2026", icon: "folder" },
            { id: "file_1", name: "Project_Presentation_2026.pdf", size: 8500000, formattedSize: "8.5 MB", date: "Oct 01, 2026", type: "pdf", icon: "file-pdf" },
            { id: "file_2", name: "Vacation_Photos_Archive.zip", size: 145000000, formattedSize: "145 MB", date: "Sep 28, 2026", type: "zip", icon: "file-zip" },
            { id: "file_5", name: "Recorded_Meeting_4K.mp4", size: 312000000, formattedSize: "312 MB", date: "Oct 01, 2026", type: "video", icon: "file-video" },
        ],
    },
    "Shared Folder/Work Projects": {
        type: "folder",
        items: [
            { id: "folder_1_1", name: "Designs & Wireframes", type: "folder", itemCount: 2, date: "Sep 29, 2026", icon: "folder" },
            { id: "file_3", name: "App_Design_Prototype.fig", size: 32400000, formattedSize: "32.4 MB", date: "Sep 29, 2026", type: "figma", icon: "file-code" },
            { id: "file_4", name: "RH_Connect_Setup_v2.exe", size: 58000000, formattedSize: "58 MB", date: "Sep 30, 2026", type: "exe", icon: "file" },
        ],
    },
    "Shared Folder/Work Projects/Designs & Wireframes": {
        type: "folder",
        items: [
            { id: "file_mock_1", name: "Mobile_UI_v1.png", size: 4200000, formattedSize: "4.2 MB", date: "Sep 28, 2026", type: "png", icon: "file-image" },
            { id: "file_mock_2", name: "Desktop_Dashboard_v2.png", size: 6100000, formattedSize: "6.1 MB", date: "Sep 29, 2026", type: "png", icon: "file-image" },
        ],
    },
    "Shared Folder/Vacation Photos": {
        type: "folder",
        items: [
            { id: "file_vac_1", name: "Beach_Sunset.jpg", size: 5400000, formattedSize: "5.4 MB", date: "Sep 20, 2026", type: "jpg", icon: "file-image" },
            { id: "file_vac_2", name: "Mountain_Trek_Video.mp4", size: 89000000, formattedSize: "89 MB", date: "Sep 22, 2026", type: "mp4", icon: "file-video" },
        ],
    },
};

let recentSentFiles = [];

// Helper: Generate Icon HTML Image with Fallback SVG
function getIconImg(iconName, extraClass = "") {
    const fallbackSvgs = {
        folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        "file-pdf": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        "file-zip": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        "file-video": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>`,
        "file-image": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230284c7" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        "file-code": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    };

    const fallback = fallbackSvgs[iconName] || fallbackSvgs["file"];
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(fallback)}`;

    return `<img class="icon-img ${extraClass}" src="assets/icons/${iconName}.svg" alt="${iconName}" onerror="this.onerror=null; this.src='${dataUri}'">`;
}

function getCurrentPathString() {
    return currentPath.join("/");
}

function getCurrentFolderItems() {
    const pathKey = getCurrentPathString();
    if (!fileSystem[pathKey]) {
        fileSystem[pathKey] = { type: "folder", items: [] };
    }
    return fileSystem[pathKey].items;
}

function renderBreadcrumbs() {
    const container = document.getElementById("breadcrumbContainer");
    const upBtn = document.getElementById("upDirectoryBtn");

    let html = `
        <span onclick="navigateToBreadcrumb(0)" class="breadcrumb-node">
          RH-Laptop
        </span>
      `;

    currentPath.forEach((segment, index) => {
        html += `<span style="color: var(--text-light); font-size: 0.65rem;">&gt;</span>`;
        const isLast = index === currentPath.length - 1;
        if (isLast) {
            html += `<span class="breadcrumb-node current">${escapeHtml(segment)}</span>`;
        } else {
            html += `<span onclick="navigateToBreadcrumb(${index})" class="breadcrumb-node">${escapeHtml(segment)}</span>`;
        }
    });

    container.innerHTML = html;

    if (currentPath.length > 1) {
        upBtn.classList.remove("hidden");
    } else {
        upBtn.classList.add("hidden");
    }
}

function openFolder(folderName) {
    currentPath.push(folderName);
    document.getElementById("searchInput").value = "";
    renderSharedFiles();
}

function navigateUpDirectory() {
    if (currentPath.length > 1) {
        currentPath.pop();
        document.getElementById("searchInput").value = "";
        renderSharedFiles();
    }
}

function navigateToBreadcrumb(index) {
    if (index >= 0 && index < currentPath.length) {
        currentPath = currentPath.slice(0, index + 1);
        document.getElementById("searchInput").value = "";
        renderSharedFiles();
    }
}

function switchTab(tab) {
    activeTab = tab;
    const tabUploadBtn = document.getElementById("tabUpload");
    const tabDownloadBtn = document.getElementById("tabDownload");
    const sectionUpload = document.getElementById("sectionUpload");
    const sectionDownload = document.getElementById("sectionDownload");

    if (tab === "upload") {
        tabUploadBtn.classList.add("active");
        tabDownloadBtn.classList.remove("active");
        sectionUpload.classList.remove("hidden");
        sectionDownload.classList.add("hidden");
    } else {
        tabDownloadBtn.classList.add("active");
        tabUploadBtn.classList.remove("active");
        sectionDownload.classList.remove("hidden");
        sectionUpload.classList.add("hidden");
        renderSharedFiles();
    }
}

function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileIconName(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "file-image";
    if (["mp4", "mkv", "mov", "avi"].includes(ext)) return "file-video";
    if (["pdf"].includes(ext)) return "file-pdf";
    if (["zip", "rar", "7z", "tar"].includes(ext)) return "file-zip";
    if (["html", "css", "js", "py", "fig"].includes(ext)) return "file-code";
    return "file";
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
        const exists = selectedUploadFiles.some((f) => f.name === file.name && f.size === file.size);
        if (!exists) {
            selectedUploadFiles.push({
                id: "up_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                fileObject: file,
                name: file.name,
                size: file.size,
                formattedSize: formatBytes(file.size),
                icon: getFileIconName(file.name),
            });
        }
    });

    renderSelectedUploadList();
    showToast(`${files.length} file(s) added to queue`);
    event.target.value = "";
}

function renderSelectedUploadList() {
    const listContainer = document.getElementById("selectedFilesList");
    const header = document.getElementById("selectedFilesHeader");
    const countText = document.getElementById("fileCountText");
    const actionButton = document.getElementById("mainActionButton");
    const actionText = document.getElementById("actionText");
    const uploadBadge = document.getElementById("uploadBadge");

    listContainer.innerHTML = "";

    if (selectedUploadFiles.length === 0) {
        header.classList.add("hidden");
        uploadBadge.classList.add("hidden");
        actionButton.classList.remove("upload-ready");
        actionText.innerText = "Select Files";
        return;
    }

    header.classList.remove("hidden");
    countText.innerText = selectedUploadFiles.length;
    uploadBadge.classList.remove("hidden");
    uploadBadge.innerText = selectedUploadFiles.length;

    actionButton.classList.add("upload-ready");
    actionText.innerText = `Upload Now (${selectedUploadFiles.length} items)`;

    selectedUploadFiles.forEach((fileItem) => {
        const itemEl = document.createElement("div");
        itemEl.className = "file-item-card";
        itemEl.innerHTML = `
          <div class="file-info-group">
            <div class="file-icon-box">
              ${getIconImg(fileItem.icon)}
            </div>
            <div class="file-details">
              <div class="file-name">${escapeHtml(fileItem.name)}</div>
              <div class="file-meta">${fileItem.formattedSize}</div>
            </div>
          </div>
          <button onclick="removeSelectedFile('${fileItem.id}')" title="Remove" class="btn-remove-file">
            ${getIconImg("close", "sm")}
          </button>
        `;
        listContainer.appendChild(itemEl);
    });
}

function removeSelectedFile(id) {
    selectedUploadFiles = selectedUploadFiles.filter((f) => f.id !== id);
    renderSelectedUploadList();
    showToast("File removed");
}

function clearAllSelected() {
    selectedUploadFiles = [];
    renderSelectedUploadList();
    showToast("Queue cleared");
}

function handleMainAction() {
    if (selectedUploadFiles.length === 0) {
        document.getElementById("fileInput").click();
    } else {
        startUploadProcess();
    }
}

function startUploadProcess() {
    if (selectedUploadFiles.length === 0) return;

    const modal = document.getElementById("transferModal");
    const progressBar = document.getElementById("modalProgressBar");
    const modalPercent = document.getElementById("modalPercent");
    const modalTitle = document.getElementById("modalTitle");
    const modalSub = document.getElementById("modalSub");

    modalTitle.innerText = "Sending to RH-Laptop";
    modalSub.innerText = `Uploading ${selectedUploadFiles.length} file(s) to ${currentPath[currentPath.length - 1]}...`;
    progressBar.style.width = "0%";
    modalPercent.innerText = "0%";
    modal.classList.remove("hidden");

    let progress = 0;
    transferInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(transferInterval);

            setTimeout(() => {
                modal.classList.add("hidden");
                const activeItems = getCurrentFolderItems();

                selectedUploadFiles.forEach((item) => {
                    const sharedItem = {
                        id: "file_uploaded_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                        name: item.name,
                        size: item.size,
                        formattedSize: item.formattedSize,
                        date: "Just now",
                        type: item.name.split(".").pop(),
                        icon: item.icon,
                    };
                    activeItems.unshift(sharedItem);
                    recentSentFiles.unshift(sharedItem);
                });

                showToast(`Uploaded ${selectedUploadFiles.length} file(s) to ${currentPath[currentPath.length - 1]}!`);
                selectedUploadFiles = [];
                renderSelectedUploadList();
                renderRecentUploads();
                renderSharedFiles();
            }, 400);
        }

        progressBar.style.width = `${progress}%`;
        modalPercent.innerText = `${progress}%`;
    }, 150);
}

function renderRecentUploads() {
    const container = document.getElementById("recentUploadsContainer");
    const list = document.getElementById("recentUploadsList");
    const countEl = document.getElementById("completedCount");

    if (recentSentFiles.length === 0) {
        container.classList.add("hidden");
        return;
    }

    container.classList.remove("hidden");
    countEl.innerText = `${recentSentFiles.length} item(s)`;
    list.innerHTML = "";

    recentSentFiles.forEach((file) => {
        const item = document.createElement("div");
        item.className = "file-item-card";
        item.style.padding = "8px 12px";
        item.innerHTML = `
          <div class="file-info-group">
            ${getIconImg(file.icon, "sm")}
            <span class="file-name" style="font-size: 0.75rem;">${escapeHtml(file.name)}</span>
          </div>
          <span style="font-size: 0.65rem; color: var(--emerald); font-weight: 700;">${file.formattedSize}</span>
        `;
        list.appendChild(item);
    });
}

function renderSharedFiles(filteredArray = null) {
    renderBreadcrumbs();

    const listContainer = document.getElementById("sharedFilesList");
    const itemCountText = document.getElementById("sharedItemCount");
    const currentFolderItems = getCurrentFolderItems();
    const itemsToDisplay = filteredArray || currentFolderItems;

    itemCountText.innerText = itemsToDisplay.length;
    listContainer.innerHTML = "";

    if (itemsToDisplay.length === 0) {
        listContainer.innerHTML = `
          <div style="padding: 32px; text-align: center; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <p style="font-size: 0.8rem; color: var(--text-muted);">This folder is empty.</p>
          </div>
        `;
        updateDownloadButtonState();
        return;
    }

    itemsToDisplay.forEach((item) => {
        const isFolder = item.type === "folder";
        const isSelected = selectedDownloadIds.has(item.id);
        const card = document.createElement("div");

        card.className = "file-item-card";
        if (isSelected) {
            card.style.borderColor = "var(--primary)";
            card.style.backgroundColor = "var(--primary-light)";
        }

        if (isFolder) {
            card.onclick = (e) => {
                if (e.target.tagName !== "INPUT" && !e.target.closest(".folder-dl-btn")) {
                    openFolder(item.name);
                }
            };

            card.innerHTML = `
            <div class="file-info-group">
              <input type="checkbox" ${isSelected ? "checked" : ""} onchange="toggleSelectDownloadFile('${item.id}')" onclick="event.stopPropagation()" style="accent-color: var(--primary);">
              <div class="file-icon-box" style="background-color: var(--amber-light); border-color: #fde68a;">
                ${getIconImg("folder")}
              </div>
              <div class="file-details">
                <div class="file-name" style="color: var(--text-main); cursor: pointer;">${escapeHtml(item.name)}</div>
                <div class="file-meta" style="color: var(--amber); font-weight: 600;">${item.itemCount || 0} item(s) • ${item.date}</div>
              </div>
            </div>
            <button onclick="event.stopPropagation(); downloadSingleItem('${item.id}')" class="folder-dl-btn btn-remove-file" title="Download Folder ZIP">
              ${getIconImg("file-zip", "sm")}
            </button>
          `;
        } else {
            card.onclick = (e) => {
                if (e.target.tagName !== "INPUT") {
                    toggleSelectDownloadFile(item.id);
                }
            };

            card.innerHTML = `
            <div class="file-info-group">
              <input type="checkbox" ${isSelected ? "checked" : ""} onchange="toggleSelectDownloadFile('${item.id}')" onclick="event.stopPropagation()" style="accent-color: var(--primary);">
              <div class="file-icon-box">
                ${getIconImg(item.icon)}
              </div>
              <div class="file-details">
                <div class="file-name">${escapeHtml(item.name)}</div>
                <div class="file-meta">${item.formattedSize} • ${item.date}</div>
              </div>
            </div>
            <button onclick="event.stopPropagation(); downloadSingleItem('${item.id}')" class="btn-remove-file" title="Download File">
              ${getIconImg("download", "sm")}
            </button>
          `;
        }

        listContainer.appendChild(card);
    });

    updateDownloadButtonState();
}

function toggleSelectDownloadFile(id) {
    if (selectedDownloadIds.has(id)) {
        selectedDownloadIds.delete(id);
    } else {
        selectedDownloadIds.add(id);
    }
    renderSharedFiles();
}

function updateDownloadButtonState() {
    const downloadNowBtn = document.getElementById("downloadNowBtn");
    const downloadBtnText = document.getElementById("downloadBtnText");
    const selectedDownloadCountText = document.getElementById("selectedDownloadCountText");
    const count = selectedDownloadIds.size;

    if (count === 0) {
        downloadNowBtn.disabled = true;
        downloadBtnText.innerText = "Select files to download";
        selectedDownloadCountText.classList.add("hidden");
    } else {
        downloadNowBtn.disabled = false;
        downloadBtnText.innerText = `Download Selected (${count})`;
        selectedDownloadCountText.classList.remove("hidden");
        selectedDownloadCountText.innerText = `${count} selected`;
    }
}

function filterSharedFiles() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const currentItems = getCurrentFolderItems();
    if (!query) {
        renderSharedFiles();
        return;
    }
    const filtered = currentItems.filter((f) => f.name.toLowerCase().includes(query));
    renderSharedFiles(filtered);
}

function toggleSelectAllShared() {
    const currentItems = getCurrentFolderItems();
    const allSelected = currentItems.length > 0 && currentItems.every((i) => selectedDownloadIds.has(i.id));

    if (allSelected) {
        currentItems.forEach((i) => selectedDownloadIds.delete(i.id));
    } else {
        currentItems.forEach((i) => selectedDownloadIds.add(i.id));
    }
    renderSharedFiles();
}

function downloadSingleItem(id) {
    const currentItems = getCurrentFolderItems();
    const item = currentItems.find((f) => f.id === id);
    if (!item) return;

    triggerDownloadProcess([item]);
}

function downloadSelectedFiles() {
    if (selectedDownloadIds.size === 0) return;
    let itemsToDownload = [];

    Object.values(fileSystem).forEach((folder) => {
        folder.items.forEach((item) => {
            if (selectedDownloadIds.has(item.id)) {
                itemsToDownload.push(item);
            }
        });
    });

    triggerDownloadProcess(itemsToDownload);
}

function triggerDownloadProcess(itemList) {
    const modal = document.getElementById("transferModal");
    const progressBar = document.getElementById("modalProgressBar");
    const modalPercent = document.getElementById("modalPercent");
    const modalTitle = document.getElementById("modalTitle");
    const modalSub = document.getElementById("modalSub");

    const isFolderDownload = itemList.some((i) => i.type === "folder");

    modalTitle.innerText = isFolderDownload ? "Compressing & Downloading" : "Downloading to Mobile";
    modalSub.innerText = `Receiving ${itemList.length} item(s)...`;
    progressBar.style.width = "0%";
    modalPercent.innerText = "0%";
    modal.classList.remove("hidden");

    let progress = 0;
    transferInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(transferInterval);

            setTimeout(() => {
                modal.classList.add("hidden");

                itemList.forEach((item) => {
                    const isFolder = item.type === "folder";
                    const filename = isFolder ? `${item.name}.zip` : item.name;
                    const content = isFolder ? `ZIP archive content: ${item.name}` : `RH Connect Content: ${item.name}`;

                    const blob = new Blob([content], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });

                showToast(`Downloaded ${itemList.length} item(s)!`);
                selectedDownloadIds.clear();
                renderSharedFiles();
            }, 300);
        }

        progressBar.style.width = `${progress}%`;
        modalPercent.innerText = `${progress}%`;
    }, 130);
}

function cancelTransfer() {
    if (transferInterval) clearInterval(transferInterval);
    document.getElementById("transferModal").classList.add("hidden");
    showToast("Transfer canceled");
}

// Drag and Drop Logic
const dropZone = document.getElementById("dropZone");

["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(
        eventName,
        (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        },
        false,
    );
});

["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
        eventName,
        (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        },
        false,
    );
});

dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files: files } });
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMessage");

    toastMsg.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function escapeHtml(text) {
    return String(text).replace(
        /[&<>"']/g,
        (m) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            })[m],
    );
}

document.getElementById("refreshBtn").addEventListener("click", () => {
    showToast("Connection active (54 Mb/s)");
});

window.onload = function () {
    renderSelectedUploadList();
    renderSharedFiles();
};

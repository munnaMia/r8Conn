let selectedUploadFiles = [];

let fileFormats = {
    "file-image": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    "file-video": ["mp4", "mkv", "mov", "avi"],
    "file-zip": ["zip", "rar", "7z", "tar"],
    "file-code": ["html", "css", "js", "py", "fig"],
    "file-pdf": ["pdf"],
};

let icons = {
    "file-image": "picture",
    "file-video": "video",
    "file-zip": "zip-file",
    "file-code": "code",
    "file-pdf": "file-pdf",
    file: "document",
    folder: "folder-open",
};

let activeTab = "upload";
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const uploadIcon = tabUploadBtn.firstElementChild;
const downloadIcon = tabDownloadBtn.firstElementChild;
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

const countText = document.getElementById("fileCountText");
const uploadBtn = document.getElementById("uploadActionButton");
const header = document.getElementById("selectedFilesHeader");
const listContainer = document.getElementById("selectedFilesList");

function switchTab(tab) {
    activeTab = tab;

    if (tab === "upload") {
        tabUploadBtn.classList.add("active");
        tabDownloadBtn.classList.remove("active");

        uploadIcon.classList.remove("muted-icon");
        uploadIcon.classList.add("white-icon");
        downloadIcon.classList.add("muted-icon");
        downloadIcon.classList.remove("white-icon");

        sectionUpload.classList.remove("hidden");
        sectionDownload.classList.add("hidden");
    } else {
        tabDownloadBtn.classList.add("active");
        tabUploadBtn.classList.remove("active");

        uploadIcon.classList.add("muted-icon");
        uploadIcon.classList.remove("white-icon");
        downloadIcon.classList.remove("muted-icon");
        downloadIcon.classList.add("white-icon");

        sectionDownload.classList.remove("hidden");
        sectionUpload.classList.add("hidden");

        renderSharedFiles();
    }
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
        const exist = selectedUploadFiles.some((f) => {
            f.name === file.name && f.size === file.size;
        });
        if (!exist) {
            selectedUploadFiles.push({
                id: "UP_" + Date.now() + "_" + Math.random().toString(36).substring(2, 4),
                name: file.name,
                icon: getFileIconName(file.name),
                size: file.size,
                formatedSize: formatBytes(file.size),
            });
        }
    });

    renderSelectedUploadList();
    event.target.value = "";
}

function renderSelectedUploadList() {
    listContainer.innerHTML = "";

    if (selectedUploadFiles.length === 0) {
        header.classList.add("hidden");
        uploadBtn.classList.add("hidden");
        return;
    }

    header.classList.remove("hidden");
    uploadBtn.classList.remove("hidden");
    countText.innerText = selectedUploadFiles.length;

    selectedUploadFiles.forEach((file) => {
        const containerEl = document.createElement("div");
        containerEl.className = "file-item-card";

        containerEl.innerHTML = `
                        <div class="file-info-group">
                            <div class="file-icon-box">
                                ${getIconImg(file.icon)}
                            </div>
                            <div class="file-details">
                                <div class="file-name">${escapeHtml(file.name)}</div>
                                <div class="file-meta">${file.formatedSize}</div>
                            </div>
                        </div>
                        <button onclick="removeSelectedFile('${file.id}')" title="remove" class="btn-remove-file">
                            <img class="icon-img sm danger-icon" src="assets/icons/cross.svg" alt="cross" />
                        </button>
        `;

        listContainer.appendChild(containerEl);
    });
}

function getIconImg(iconName, extraClass = "") {
    const iconSrc = icons[iconName] || icons["file"];
    return `<img src="assets/icons/${iconSrc}.svg" class="icon-img ${extraClass}"></img>`;
}

function escapeHtml(text) {
    const htmlEntities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;",
    };

    return String(text).replace(/[&<>"']/g, (match) => htmlEntities[match]);
}

function removeSelectedFile(id) {}

// format bytes into Bytes, KB, MB, GB, TB.
function formatBytes(bytes, decimals = 1) {
    if (!bytes) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const sz = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(sz));

    return parseFloat(bytes / Math.pow(sz, i)).toFixed(dm) + " " + sizes[i];
}

// Get a icon name for a file.
function getFileIconName(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();

    for (const [key, value] of Object.entries(fileFormats)) {
        if (value.includes(ext)) {
            return key;
        }
    }

    return "file";
}

function startUploadProcess() {
    if (selectedUploadFiles.length === 0) return;
}

function clearAllSeleceted() {}
function renderSharedFiles() {}

window.onload = function () {
    removeSelectedFile();
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

let configuration;

let selectedUploadFiles = [];
let recentSentFiles = [];

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

// tab section
let activeTab = "upload";
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const uploadIcon = tabUploadBtn.firstElementChild;
const downloadIcon = tabDownloadBtn.firstElementChild;
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

// seleceted files section.
const countText = document.getElementById("fileCountText");
const uploadBtn = document.getElementById("uploadActionButton");
const header = document.getElementById("selectedFilesHeader");
const listContainer = document.getElementById("selectedFilesList");

// recent upload section
const recentContainer = document.getElementById("recentUploadsContainer");
const recentUploadList = document.getElementById("recentUploadsList");
const sentCount = document.getElementById("completedCount");

// model elements
const modal = document.getElementById("transferModal");
const progressBar = document.getElementById("modalProgressBar");
const modalPercent = document.getElementById("modalPercent");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalSize = document.getElementById("modalTransferSize");

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
        const exist = selectedUploadFiles.some((f) => f.name === file.name && f.size === file.size);

        if (!exist) {
            selectedUploadFiles.push({
                id: "UP_" + Date.now() + "_" + Math.random().toString(36).substring(2, 4),
                name: file.name,
                icon: getFileIconName(file.name),
                size: file.size,
                formatedSize: formatBytes(file.size),
                rawFile: file,
            });
        }
    });

    renderSelectedUploadList();
    event.target.value = "";
}

async function startUploadProcess(event) {
    event.preventDefault();

    if (selectedUploadFiles.length === 0) return;

    modalTitle.innerText = "Sending to host device";
    modalSub.innerText = `Uploading ${selectedUploadFiles.length} item(s) to ${configuration.storageDir}`;
    progressBar.style.width = "0%";
    modalPercent.innerText = "0%";
    modal.classList.remove("hidden");

    await uploadProcess();
}

// calculate the total uploaded file size
function countBytesSize(files) {
    return files.reduce((sum, item) => (sum += item.rawFile.size), 0);
}

async function uploadProcess() {
    const totalBytesSize = countBytesSize(selectedUploadFiles);
    const totalSizeFormated = formatBytes(totalBytesSize);
    let uploadedBytes = 0;

    for (item of selectedUploadFiles) {
        let file = item.rawFile;
        let uploadID = item.id;
        let totalChunk = Math.ceil(file.size / CHUNK_SIZE);

        for (let chunkIdx = 0; chunkIdx < totalChunk; chunkIdx++) {
            let start = CHUNK_SIZE * chunkIdx;
            let end = Math.min(start + CHUNK_SIZE, file.size);

            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("uploadID", uploadID);
            formData.append("fileName", file.name);
            formData.append("chunkIdx", chunkIdx);
            formData.append("totalChunk", totalChunk);
            formData.append("chunk", chunk);

            const response = await fetch("/files", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error(`failed to upload ${chunkIdx} file name : ${file.name}`);
                return;
            }

            uploadedBytes += chunk.size;
            const formatedUploadedSize = formatBytes(uploadedBytes);
            const percent = totalBytesSize === 0 ? 100 : Math.floor((uploadedBytes / totalBytesSize) * 100);

            renderTransferModal(percent, formatedUploadedSize, totalSizeFormated);
        }
    }

    // hide modal and show toast
    modal.classList.add("hidden");

    // make files list empty after uploading all files
    selectedUploadFiles = [];
    renderSelectedUploadList();
    renderRecentSentFiles();
}

// render the files that has been selected to send
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

// render the files that has been sended
function renderRecentSentFiles() {
    if (recentSentFiles.length === 0) {
        recentContainer.classList.add("hidden");
        return;
    }

    recentContainer.classList.remove("hidden");
    sentCount.innerText = `${recentSentFiles.length} items`;
    recentUploadList.innerHTML = "";

    recentSentFiles.forEach((file) => {
        const item = document.createElement("div");
        item.className = "file-item-card";
        item.style.padding = "8px 12px";
        item.innerHTML = `
            <div class="file-info-group">
                ${getIconImg(file.icon, "sm")}
                <span class="file-name" style="font-size: 0.75rem;">${escapeHtml(file.name)}</span>
            </div>
            <span style="font-size:0.65rem; color: var(--emerald); font-weight: 700;">${file.formattedSize}</span>
        `;

        recentUploadList.appendChild(item);
    });
}

// render the modal
function renderTransferModal(percent, uploadedSize, totalSize) {
    progressBar.style.width = `${percent}%`;
    modalPercent.innerText = `${percent}%`;
    modalSize.innerText = `${uploadedSize}/${totalSize}`;
}

// get a icon for specific name
function getIconImg(iconName, extraClass = "") {
    const iconSrc = icons[iconName] || icons["file"];
    return `<img src="assets/icons/${iconSrc}.svg" class="icon-img ${extraClass}"></img>`;
}

// escape html chars
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

// remove a file from selectedUploadfiles array.
function removeSelectedFile(id) {
    selectedUploadFiles = selectedUploadFiles.filter((f) => f.id !== id);
    renderSelectedUploadList();
}

// remove all element from the array
function clearAllSeleceted() {
    selectedUploadFiles = [];
    renderSelectedUploadList();
}

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

function cancelTransfer() {}

function renderSharedFiles() {}

async function getConfigs() {
    try {
        const response = await fetch("/configs");

        if (!response.ok) {
            throw new Error(`http error :${response.status}`);
        }

        configuration = await response.json();
    } catch (error) {
        console.error("failed to fetch configurations: ", error);
    }
}

window.onload = function () {
    getConfigs();
    removeSelectedFile();
};

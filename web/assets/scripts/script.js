const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const Dir_Level = 0; // 0 mean root level
let breadcrumb = ["/"]; // level 0 start with '/'

let configuration;

let selectedUploadFiles = [];
let recentSentFiles = [];

// remove test data and fetch from api latter
let sharedFiles = {
    msg: "Share directory file tree",
    data: [
        {
            name: "Screenshot From 2026-10-08 13-11-32.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-08 13-11-32.png",
            size: 76023,
        },

        {
            name: "Screenshot From 2026-10-14 15-36-47.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-14 15-36-47.png",
            size: 101366,
        },
        {
            name: "Screenshot From 2026-10-15 13-44-31.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 13-44-31.png",
            size: 50374,
        },
        {
            name: "Screenshot From 2026-10-15 14-13-49.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 14-13-49.png",
            size: 29241,
        },
        {
            name: "Screenshot From 2026-10-15 15-25-54.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 15-25-54.png",
            size: 21327,
        },
        {
            name: "Screenshot From 2026-10-15 22-24-45.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 22-24-45.png",
            size: 382464,
        },
        {
            name: "Screenshot From 2026-10-15 22-49-39.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 22-49-39.png",
            size: 276267,
        },
        {
            name: "Screenshot From 2026-10-15 23-04-48.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-15 23-04-48.png",
            size: 419692,
        },
        {
            name: "Screenshot From 2026-10-16 10-40-13.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-16 10-40-13.png",
            size: 738011,
        },
        {
            name: "Screenshot From 2026-10-16 10-41-06.png",
            path: "Pictures/Screenshots/Screenshot From 2026-10-16 10-41-06.png",
            size: 521173,
        },
        {
            name: "Screenshot From 2026-10-07 11-36-54.png",
            path: "Screenshot From 2026-10-07 11-36-54.png",
            size: 35916,
        },
        {
            name: "Screenshot From 2026-10-08 11-43-51.png",
            path: "Screenshot From 2026-10-08 11-43-51.png",
            size: 37754,
        },
        {
            name: "System Analysis concept.1st week.pdf",
            path: "university document/System Analysis concept.1st week.pdf",
            size: 176037,
        },
        {
            name: "case study 3rd week SDLC.pdf",
            path: "university document/case study 3rd week SDLC.pdf",
            size: 187407,
        },
        {
            name: "ch3_1_v1.ppt (1).pdf",
            path: "university document/ch3_1_v1.ppt (1).pdf",
            size: 2332978,
        },
        {
            name: "ch3_1_v1.ppt.pdf",
            path: "university document/ch3_1_v1.ppt.pdf",
            size: 2332978,
        },
        {
            name: "ch3_2_v1.ppt.pdf",
            path: "university document/ch3_2_v1.ppt.pdf",
            size: 995171,
        },
        {
            name: "ch3_3_v1.ppt.pdf",
            path: "university document/ch3_3_v1.ppt.pdf",
            size: 855704,
        },
        {
            name: "ch3_4_v1.ppt.pdf",
            path: "university document/ch3_4_v1.ppt.pdf",
            size: 522412,
        },
        {
            name: "ch3_5_v1.ppt.pdf",
            path: "university document/ch3_5_v1.ppt.pdf",
            size: 659263,
        },
        {
            name: "system analysis 2nd week (1).pdf",
            path: "university document/system analysis 2nd week (1).pdf",
            size: 275087,
        },
        {
            name: "system analysis 2nd week.pdf",
            path: "university document/system analysis 2nd week.pdf",
            size: 275087,
        },
    ],
    status: 200,
};

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

// download tab elements
const listSharedContainer = document.getElementById("sharedFilesList");
const itemCountText = document.getElementById;

// tab sections elements
let activeTab = "upload";
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const uploadIcon = tabUploadBtn.firstElementChild;
const downloadIcon = tabDownloadBtn.firstElementChild;
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

// manage the tab switching
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

// seleceted files section.
const dropZone = document.getElementById("dropZone");
const countText = document.getElementById("fileCountText");
const uploadBtn = document.getElementById("uploadActionButton");
const header = document.getElementById("selectedFilesHeader");
const listSeletedContainer = document.getElementById("selectedFilesList");

// handle the file selections
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
        const exist = selectedUploadFiles.some((f) => f.name === file.name && f.size === file.size);

        if (!exist) {
            selectedUploadFiles.push({
                id: "r8Conn_" + Date.now() + "_" + Math.random().toString(36).substring(2, 4),
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

// render the files that has been selected to send
function renderSelectedUploadList() {
    listSeletedContainer.innerHTML = "";

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

        listSeletedContainer.appendChild(containerEl);
    });
}

// begin the upload process
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

// manage the upload process
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

        recentSentFiles.unshift(item);
    }

    // show close modal btn
    modalClose.classList.remove("hidden");

    // show toast massage
    showToast(`Sent ${selectedUploadFiles.length} file(s) successfully`);

    // make files list empty after uploading all files
    selectedUploadFiles = [];
    renderSelectedUploadList();
    renderRecentSentFiles();
}

// recent upload section
const recentContainer = document.getElementById("recentUploadsContainer");
const recentUploadList = document.getElementById("recentUploadsList");
const sentCount = document.getElementById("completedCount");

// render the files that has been sended
function renderRecentSentFiles() {
    if (recentSentFiles.length === 0) {
        recentContainer.classList.add("hidden");
        return;
    }

    recentContainer.classList.remove("hidden");
    sentCount.innerText = `${recentSentFiles.length} items`;
    recentUploadList.innerHTML = "";

    recentSentFiles.forEach((item) => {
        const containerEl = document.createElement("div");
        containerEl.className = "file-item-card";
        containerEl.style.padding = "8px 12px";
        containerEl.innerHTML = `
                        <div class="file-info-group">
                            ${getIconImg(item.icon, "sm")}
                            <div class="file-name">${escapeHtml(item.name)}</div>
                        </div>
                        <span class="file-meta" style="font-size:0.65rem; color: var(--emerald); font-weight: 700;">${item.formatedSize}</span>
                    `;

        console.log(containerEl);
        recentUploadList.appendChild(containerEl);
    });
}

// model elements
const modal = document.getElementById("transferModal");
const progressBar = document.getElementById("modalProgressBar");
const modalPercent = document.getElementById("modalPercent");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalSize = document.getElementById("modalTransferSize");
const modalClose = document.getElementById("modalCloseBtn");

// render the modal
function renderTransferModal(percent, uploadedSize, totalSize) {
    progressBar.style.width = `${percent}%`;
    modalPercent.innerText = `${percent}%`;
    modalSize.innerText = `${uploadedSize}/${totalSize}`;
}

// close the modal
function closeModal() {
    modal.classList.add("hidden");
    modalClose.classList.add("hidden");
}

// toast elements
const toastContainer = document.getElementById("toast");
const toastMsg = document.getElementById("toastTitle");

// render toast
function showToast(msg) {
    toastMsg.innerText = msg;
    toastContainer.classList.add("show");

    setTimeout(() => {
        toastContainer.classList.remove("show");
    }, 3000);
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

// calculate the total uploaded file size
function countBytesSize(files) {
    return files.reduce((sum, item) => (sum += item.rawFile.size), 0);
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

// get a icon for specific name
function getIconImg(iconName, extraClass = "") {
    const iconSrc = icons[iconName] || icons["file"];
    return `<img src="assets/icons/${iconSrc}.svg" class="icon-img ${extraClass}"></img>`;
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

function navigateUpDirectory() {}

function renderSharedFiles() {
    // get the files list from api and render them
    // render them here
}

function filterSharedFiles() {}

function toggleSelectAllShared() {}

function downloadSeletedFiles() {}

// call api to fetch all the files list from backend
async function getSharedFiles() {
    // uncommented latter
    // try {
    //     const response = await fetch("/filesInfo");
    //     if (!response.ok) {
    //         throw new Error(`http error :${response.status}`);
    //     }

    //     res = await response.json();
    //     sharedFiles = res.data;
    // } catch (error) {
    //     console.error("failed to fetch configurations: ", error);
    // }

    formatedSharedFilesPath();
}

// add a new field for path array for each file breadcremb
function formatedSharedFilesPath() {
    if (sharedFiles.length === 0) return;

    sharedFiles.forEach((file) => {
        file["dirList"] = getDirList(file.path);
    });
}

// subtract all the folders name and remove file names and return an array
function getDirList(path) {
    let pathArr = path.toString().replace(/\\/g, "/").split("/").pop();
    pathArr.pop();
    return pathArr;
}

async function getConfigs() {
    try {
        const response = await fetch("/configs");

        if (!response.ok) {
            throw new Error(`http error :${response.status}`);
        }

        res = await response.json();
        configuration = res.data;
    } catch (error) {
        console.error("failed to fetch configurations: ", error);
    }
}

// handle drag and drop feature for file upload
["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
    });
});

dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({
            target: {
                files: files,
            },
        });
    }
});

window.onload = function () {
    getConfigs();
    getSharedFiles();
    renderSelectedUploadList();
    renderRecentSentFiles();
    renderSharedFiles();
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
let breadcrumbArray = ["/"]; // level 0 start with '/'

let configuration;
let deviceID = localStorage.getItem("r8Conn_device_id");

let selectedUploadFiles = [];
let recentSentFiles = [];

// remove test data and fetch from api latter
let sharedFiles;
let hasSelectedDownloadIds = new Set();
let subFolders = new Set();

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
    download: "download",
};

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

// tab sections elements
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const uploadIcon = tabUploadBtn.firstElementChild;
const downloadIcon = tabDownloadBtn.firstElementChild;
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

// manage the tab switching
function switchTab(tab = "upload") {
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

// begin the upload process
async function startUploadProcess(event) {
    event.preventDefault();

    if (selectedUploadFiles.length === 0) return;

    if (!deviceID) {
        deviceID = "r8Conn_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("r8Conn_device_id", deviceID);
    }

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

    for (let item of selectedUploadFiles) {
        let file = item.rawFile;
        let fileIcon = item.icon;
        let uploadID = item.id;
        let totalChunk = Math.ceil(file.size / CHUNK_SIZE);

        for (let chunkIdx = 0; chunkIdx < totalChunk; chunkIdx++) {
            let start = CHUNK_SIZE * chunkIdx;
            let end = Math.min(start + CHUNK_SIZE, file.size);

            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("uploadID", uploadID);
            formData.append("fileName", file.name);
            formData.append("fileSize", file.size);
            formData.append("fileIcon", fileIcon);
            formData.append("chunkIdx", chunkIdx);
            formData.append("totalChunk", totalChunk);
            formData.append("chunk", chunk);

            const response = await fetch("/files", {
                method: "POST",
                headers: {
                    "X-Device-Id": deviceID,
                },
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
                        <span class="file-meta" style="font-size:0.65rem; color: var(--emerald); font-weight: 700; width: 50px;">${item.formatedSize}</span>
                    `;

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

// // download tab elements
const listSharedContainer = document.getElementById("sharedFilesList");
const itemCountText = document.getElementById("sharedItemCount");
const downloadBtn = document.getElementById("downloadNowBtn");

function renderSharedFiles() {
    renderBreadcrumbs();

    listSharedContainer.innerHTML = "";
    itemCountText.innerText = sharedFiles.length;

    if (sharedFiles.length === 0) {
        downloadBtn.classList.add("hidden");

        listSharedContainer.innerHTML = `
            <div class="no-content" id="noContent">
                <span class="no-content-msg">No folder has been seleted</span>
                <p class="no-content-smsg">Go to App setting or use CLI flags</p>
            </div>
        `;

        return;
    }

    downloadBtn.classList.remove("hidden");
    const curDirInfo = getCurrentDirectoryInfo();

    // filter out files based on folder name its complecated and developer own logic so sorry if u feel odd for this one
    let itemToShow = sharedFiles.filter((f) => {
        return f.dirList[curDirInfo.dir_level] === curDirInfo.name && f.dirList.length - 1 === curDirInfo.dir_level;
    });

    subFolders.clear(); // clear the sub folder set before rendering

    // extract the subfolder names.
    sharedFiles.forEach((f) => {
        if (curDirInfo.dir_level < f.dirList.length - 1) {
            subFolders.add(f.dirList[curDirInfo.dir_level + 1]);
        }
    });

    subFolders.forEach((folder) => {
        const card = document.createElement("div");
        card.className = "file-item-card";

        card.onclick = (e) => {
            // open the folder
            openFolder(folder);
        };

        card.innerHTML = `
        <div class="file-info-group">
            <div class= "file-share-sub-container">
                <div class="file-icon-box" style="background-color: var(--amber-light); border-color: #fde68a;">
                    ${getIconImg("folder")}
                </div>
                <div class="file-details">
                    <div class="file-name" style="cursor: pointer;">${escapeHtml(folder)}</div>
                </div>
            </div>
        </div>
        `;

        listSharedContainer.appendChild(card);
    });

    itemToShow.forEach((file) => {
        const isSelected = hasSelectedDownloadIds.has(file.id);
        const card = document.createElement("div");
        card.className = "file-item-card";

        if (isSelected) {
            card.style.borderColor = "var(--primary)";
            card.style.backgroundColor = "var(--primary-light)";
        }

        card.onclick = (e) => {
            if (e.target.closest("button")) return;
            toggleSelectDownloadFile(file.id);
        };

        card.innerHTML = `
        <div class="file-info-group" style="justify-content: space-between;">
            <div class="file-share-sub-container">
                <div class="file-icon-box">
                    ${getIconImg(file.icon)}
                </div>
                <div class="file-details" style="max-width: 220px;">
                    <div class="file-name">${escapeHtml(file.name)}</div>
                    <div class="file-meta">${file.formatedSize}</div>
                </div>
            </div>
            <button onclick="event.stopPropagation(); downloadFile('${file.path}')" class="btn-remove-file" title="Download File">
                ${getIconImg("download", "sm")}
            </button>
        </div>
        `;

        listSharedContainer.appendChild(card);
    });
}

// return info about current dir name and its level
function getCurrentDirectoryInfo() {
    const Dir_Level = breadcrumbArray.length - 1;
    return {
        name: breadcrumbArray[Dir_Level],
        dir_level: Dir_Level,
    };
}

// download tab breadcrumb section
const breadcrumbContainer = document.getElementById("breadcrumbContainer");
const breadcrumbUpBtn = document.getElementById("upDirctoryBtn");

// render the breadcrumbs
function renderBreadcrumbs() {
    let html = ``;
    let breadcrembLength = breadcrumbArray.length;

    breadcrumbArray.forEach((folder, index) => {
        html += `<span style="color: var(--text-light); font-size: 0.65rem;">&gt</span>`;

        let isLast = index === breadcrembLength - 1;
        if (isLast) {
            html += `<span class="breadcrumb-node current">${escapeHtml(folder)}</span>`;
        } else {
            html += `<span class="breadcrumb-node">${escapeHtml(folder)}</span>`;
        }
    });

    breadcrumbContainer.innerHTML = html;

    if (breadcrumbArray.length > 1) {
        breadcrumbUpBtn.classList.remove("hidden");
    } else {
        breadcrumbUpBtn.classList.add("hidden");
    }
}

// open a folder
function openFolder(name) {
    breadcrumbArray.push(name);
    renderSharedFiles();
}

// pop one folder from breadcrumb and render shared files
function navigateUpDirectory() {
    breadcrumbArray.pop();
    renderSharedFiles();
}

function toggleSelectDownloadFile(id) {
    if (hasSelectedDownloadIds.has(id)) {
        hasSelectedDownloadIds.delete(id);
    } else {
        hasSelectedDownloadIds.add(id);
    }
    renderSharedFiles();
}

function downloadSeletedFiles() {
    let pathArrayToDownload = [];

    sharedFiles.forEach((file) => {
        if (hasSelectedDownloadIds.has(file.id)) {
            pathArrayToDownload.push(file.path);
        }
    });

    downloadProcess(pathArrayToDownload);
}

function downloadFile(path) {
    const pathArrayToDownload = Array.isArray(path) ? path : [path];

    downloadProcess(pathArrayToDownload);
}

async function downloadProcess(paths) {
    const ToDownloadPaths = Array.isArray(paths) ? paths : [paths];

    if (ToDownloadPaths.length === 0) {
        alert("select files to download");
        return;
    }

    try {
        const response = await fetch("/getDownloadToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ToDownloadPaths }),
        });

        if (!response.ok) {
            throw new Error("failed to fetch a download session");
        }

        const data = await response.json();
        const token = data.token;

        const downloadURL = `/files?token=${encodeURIComponent(token)}`;

        const a = document.createElement("a");
        a.href = downloadURL;

        if (ToDownloadPaths.length === 1) {
            a.download = ToDownloadPaths[0].toString().replace(/\\/g, "/").split("/").pop();
        } else {
            a.download = `r8Conn_download_${token.slice(0, 5)}.zip`;
        }

        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (error) {
        console.error("Download error", error);
        alert("could not start download. try again");
    }
}

// call api to fetch all the files list from backend to download
async function getFileTree() {
    try {
        const response = await fetch("/filesTree");
        if (!response.ok) {
            throw new Error(`http error :${response.status}`);
        }

        const res = await response.json();
        sharedFiles = res.data;
    } catch (error) {
        console.error("failed to fetch configurations: ", error);
    }

    formatedSharedFilesInfos();
}

// add a new field for path array for each file breadcremb
function formatedSharedFilesInfos() {
    if (sharedFiles.length === 0) return;

    sharedFiles.forEach((file) => {
        file["dirList"] = getDirList(file.path);
        file["icon"] = getIconImg(getFileIconName(file.name));
        file["formatedSize"] = formatBytes(file.size);
    });
}

// subtract all the folders name and remove file names and return an array
function getDirList(path) {
    let pathArray = ["/"];
    let folders = path.toString().replace(/\\/g, "/").split("/");
    folders.forEach((f) => pathArray.push(f));
    pathArray.pop();

    return pathArray;
}

async function getConfigs() {
    try {
        const response = await fetch("/configs");

        if (!response.ok) {
            throw new Error(`http error :${response.status}`);
        }

        const res = await response.json();
        configuration = res.data;
    } catch (error) {
        console.error("failed to fetch configurations: ", error);
    }
}

async function getRecentShared() {
    if (!deviceID) return;

    try {
        const response = await fetch("recentShares", {
            method: "GET",
            headers: {
                "X-Device-Id": deviceID,
            },
        });
        if (!response.ok) {
            throw new Error("failed to fetch recent shared file history");
        }

        const res = await response.json();
        const recentTransferFiles = res.data;

        recentTransferFiles.forEach((t) => {
            recentSentFiles.push({
                id: t.id,
                name: t.fileName,
                icon: t.fileIcon,
                size: t.fileSize,
                formatedSize: formatBytes(t.fileSize),
            });
        });
    } catch (error) {
        console.error("failed to fetch recent history", error);
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

window.addEventListener("load", async () => {
    await Promise.all([getConfigs(), getFileTree(), getRecentShared()]);

    renderSelectedUploadList();
    renderRecentSentFiles();
    renderSharedFiles();
});

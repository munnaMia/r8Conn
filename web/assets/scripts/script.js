let selectedUploadFiles = [];

let fileFormats = {
    "file-image": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    "file-video": ["mp4", "mkv", "mov", "avi"],
    "file-zip": ["zip", "rar", "7z", "tar"],
    "file-code": ["html", "css", "js", "py", "fig"],
    "file-pdf": ["pdf"],
};

let activeTab = "upload";
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const uploadIcon = tabUploadBtn.firstElementChild;
const downloadIcon = tabDownloadBtn.firstElementChild;
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

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
function renderSelectedUploadList() {}
function renderSharedFiles() {}

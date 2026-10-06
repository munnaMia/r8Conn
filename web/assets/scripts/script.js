let activeTab = "upload";
const tabUploadBtn = document.getElementById("tabUpload");
const tabDownloadBtn = document.getElementById("tabDownload");
const sectionUpload = document.getElementById("sectionUpload");
const sectionDownload = document.getElementById("sectionDownload");

function switchTab(tab) {
    activeTab = tab;

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

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // do something ...
}

function renderSharedFiles() {}

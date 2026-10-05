let activeTab = "upload";

function switchTab(tab) {
    activeTab = tab;

    const tabUploadBtn = document.getElementById("tabUpload");
    const tabDownloadBtn = document.getElementById("tabDownload");

    if (tab === "upload") {
        tabUploadBtn.classList.add("active");
        tabDownloadBtn.classList.remove("active");
    } else {
        tabDownloadBtn.classList.add("active");
        tabUploadBtn.classList.remove("active");
    }
}

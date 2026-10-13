package handler

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func (h *Handler) uploadFiles(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10MB memory buffer max
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	fileStream, _, err := r.FormFile("chunk")
	if err != nil {
		http.Error(w, "Missing chunk file", http.StatusBadRequest)
		return
	}
	defer fileStream.Close()

	uploadId := r.FormValue("uploadID")
	fileName := r.FormValue("fileName")
	chunkIdx, _ := strconv.Atoi(r.FormValue("chunkIdx"))
	totalChunk, _ := strconv.Atoi(r.FormValue("totalChunk"))

	fileExt := filepath.Ext(fileName)
	fileNameWithoutExt := strings.TrimSuffix(fileName, fileExt)
	uniqueFileName := fmt.Sprintf("%s_%s", fileNameWithoutExt, uploadId)

	filePath := filepath.Join(h.config.StorageDir, uniqueFileName)

	dst, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		http.Error(w, "server storage error", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, fileStream)
	if err != nil {
		http.Error(w, "failed to write chunk data", http.StatusInternalServerError)
		return
	}

	if chunkIdx == totalChunk-1 {
		slog.Info("Successfully upload file", "file", uniqueFileName)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("chunk received"))
}

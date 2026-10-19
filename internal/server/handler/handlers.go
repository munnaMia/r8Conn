package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/munnaMia/r8Conn/utils"
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

	uniqueFileName := fmt.Sprintf("%s_%s",
		strings.TrimSuffix(fileName, filepath.Ext(fileName)),
		uploadId,
	)

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

func (h *Handler) getFiles(w http.ResponseWriter, r *http.Request) {}

func (h *Handler) getFilesInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	en := json.NewEncoder(w)

	if h.config.ShareDir == "" {
		err := en.Encode(ErrorResponse{
			Msg:    "Select a directory to share",
			Status: http.StatusNoContent,
		})
		if err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
		}
		return
	}

	err := en.Encode(SuccessResponse{
		Msg:    "Share directory file tree",
		Data:   utils.GetFileTree(h.config.ShareDir),
		Status: http.StatusOK,
	})
	if err != nil {
		http.Error(w, "failed to encode json", http.StatusInternalServerError)
	}
}

func (h *Handler) getConfigs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	en := json.NewEncoder(w)

	res := SuccessResponse{
		Msg:    "Application configuration",
		Data:   h.config,
		Status: http.StatusOK,
	}

	err := en.Encode(res)
	if err != nil {
		http.Error(w, "failed to encode json", http.StatusInternalServerError)
		return
	}
}

package handler

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/munnaMia/r8Conn/utils"
)

const (
	maxRequestSize = 1 << 20  // 1 MB
	maxBufferSize  = 10 << 20 //10 MB
	tokenLifeTime  = 5 * time.Minute
)

var (
	sessionStore = make(map[string][]string)
	sessionLock  sync.RWMutex
)

func (h *Handler) uploadFiles(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(maxBufferSize)
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

func (h *Handler) getFiles(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		slog.Error("token not provided")
		http.Error(w, "provide a token", http.StatusBadRequest)
		return
	}

	sessionLock.Lock()
	paths, exist := sessionStore[token]
	sessionLock.Unlock()

	if !exist {
		slog.Error("token has been expired or not exist")
		http.Error(w, "invalid or expire token", http.StatusBadRequest)
		return
	}

	// single file transfer
	if len(paths) == 1 {
		filePath := filepath.Join(h.config.ShareDir, paths[0])

		info, err := os.Stat(filePath)
		if err != nil {
			slog.Error("failed to get stat about a file", "error", err)
			http.Error(w, "file not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, info.Name()))
		http.ServeFile(w, r, filePath)
		return
	}

	// multiple file transfer
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="r8Conn-download.zip"`)

	nameMap := make(map[string]bool)
	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()

	for _, path := range paths {

		if path == "" {
			continue
		}

		filePath := filepath.Join(h.config.ShareDir, path)

		file, err := os.Open(filePath)
		if err != nil {
			slog.Error("failed to open file", "error", err)
			continue
		}

		info, err := os.Stat(filePath)
		if err != nil {
			slog.Error("failed to get stat about a file", "error", err)
			file.Close()
			continue
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			slog.Error("failed to assing zip infos", "error", err)
			file.Close()
			continue
		}
		header.Name = utils.GetUniqueFileName(path, nameMap)
		header.Method = zip.Deflate

		entryWriter, err := zipWriter.CreateHeader(header)
		if err != nil {
			slog.Error("failed to create zip header", "error", err)
			file.Close()
			continue
		}

		// stream the file on zip
		_, err = io.Copy(entryWriter, file)
		file.Close()
		if err != nil {
			slog.Error("failed to copy the data", "error", err)
			continue
		}

	}
}

func (h *Handler) getDownloadToken(w http.ResponseWriter, r *http.Request) {
	var req DownloadRequest
	var tkRes TokenResponse

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.Paths) == 0 {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	tkRes.Token = utils.GenerateToken()

	sessionLock.Lock()
	sessionStore[tkRes.Token] = req.Paths
	sessionLock.Unlock()

	// delete auto matically session after 5 minute
	go func() {
		time.Sleep(tokenLifeTime)
		sessionLock.Lock()
		delete(sessionStore, tkRes.Token)
		sessionLock.Unlock()
	}()

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(&tkRes)
	if err != nil {
		slog.Error("failed to encode the token response", "error", err)
		http.Error(w, "failed to encode token json", http.StatusInternalServerError)
		return
	}
}

func (h *Handler) getFilesInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if h.config.ShareDir == "" {
		http.Error(w, "Select a directory to share", http.StatusNoContent)
		return
	}

	fileTree, err := utils.GetFileTree(h.config.ShareDir)
	if err != nil {
		slog.Error("failed to parse file tree", "error", err)
		http.Error(w, "failed to read share directory", http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(SuccessResponse{
		Msg:    "Share directory file tree",
		Data:   fileTree,
		Status: http.StatusOK,
	})
	if err != nil {
		slog.Error("failed to stream the file tree", "error", err)
		http.Error(w, "failed to encode json", http.StatusInternalServerError)
		return
	}
}

func (h *Handler) getConfigs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	err := json.NewEncoder(w).Encode(SuccessResponse{
		Msg:    "Application configuration",
		Data:   h.config,
		Status: http.StatusOK,
	})
	if err != nil {
		slog.Error("failed to stream the configs", "error", err)
		http.Error(w, "failed to encode json", http.StatusInternalServerError)
		return
	}
}

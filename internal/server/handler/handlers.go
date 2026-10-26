package handler

import (
	"archive/zip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime"
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
	maxPathsLimit  = 500
	tokenLifeTime  = 5 * time.Minute
)

var (
	sessionStore = make(map[string][]string)
	sessionLock  sync.RWMutex
)

type downloadFile struct {
	name string
	path string
}

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
		http.Error(w, "provide a token", http.StatusBadRequest)
		return
	}

	sessionLock.Lock()
	paths, exist := sessionStore[token]
	delete(sessionStore, token)
	sessionLock.Unlock()

	if !exist {
		http.Error(w, "invalid or expire token", http.StatusBadRequest)
		return
	}

	files := make([]downloadFile, 0, len(paths))
	nameMap := make(map[string]bool)

	for _, rawPath := range paths {
		fullPath, _, err := utils.ResolvePath(h.config.ShareDir, rawPath)
		if err != nil {
			slog.Error("skipping unavailable selected file", "error", err)
			continue
		}

		files = append(files, downloadFile{
			name: utils.GetUniqueFileName(filepath.Base(fullPath), nameMap),
			path: fullPath,
		})
	}

	if len(files) == 0 {
		http.Error(w, "no valid file found", http.StatusNotFound)
		return
	}

	// single file transfer
	if len(files) == 1 {
		file, err := os.Open(files[0].path)
		if err != nil {
			http.Error(w, "file unavailable", http.StatusNotFound)
			return
		}
		defer file.Close()

		info, err := file.Stat()
		if err != nil || !info.Mode().IsRegular() {
			http.Error(w, "file unavailable", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": files[0].name}))
		w.Header().Set("Content-Length", fmt.Sprintf("%d", info.Size()))

		if _, err = io.Copy(w, file); err != nil {
			slog.Error("single file transfer failed", "error", err)
		}
		return
	}

	// multiple file transfer
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="r8Conn-download.zip"`)
	w.Header().Set("X-Content-Type-Options", "nosniff")

	zipWriter := zip.NewWriter(w)
	defer func() {
		if err := zipWriter.Close(); err != nil {
			slog.Error("failed to finalize zip archive", "error", err)
		}
	}()

	for _, file := range files {
		f, err := os.Open(file.path)
		if err != nil {
			slog.Error("failed to open file", "error", err)
			return
		}

		info, err := f.Stat()
		if err != nil || !info.Mode().IsRegular() {
			slog.Error("failed to get stat about a file", "error", err)
			f.Close()
			return
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			f.Close()
			slog.Error("failed to create zip header", "error", err)
			return
		}

		header.Name = file.name
		header.Method = zip.Deflate

		entryWriter, err := zipWriter.CreateHeader(header)
		if err != nil {
			f.Close()
			slog.Error("failed to create zip entry", "error", err)
			return
		}

		// stream the file on zip
		_, err = io.Copy(entryWriter, f)
		closeErr := f.Close()
		if err != nil {
			slog.Error("failed to copy the data", "path", file.path, "error", err)
			return
		}

		if closeErr != nil {
			slog.Error("failed to close file", "error", err)
			return
		}

	}
}

func (h *Handler) getDownloadToken(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestSize)
	defer r.Body.Close()

	var req DownloadRequest
	var tkRes TokenResponse

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		var maxErr http.MaxBytesError
		if errors.Is(err, &maxErr) {
			http.Error(w, "request body is too large", http.StatusRequestEntityTooLarge)
			return
		}
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if len(req.Paths) == 0 || len(req.Paths) > maxPathsLimit {
		http.Error(w, "selected path 0 or more them the limit 500", http.StatusBadRequest)
		return
	}

	validPaths := make([]string, 0)

	for _, path := range req.Paths {
		_, _, err := utils.ResolvePath(h.config.ShareDir, path)
		if err != nil {
			slog.Error("rejected selected path", "error", err)
			http.Error(w, "one or more paths are invalid", http.StatusBadRequest)
			return
		}

		rel := filepath.Clean(filepath.FromSlash(strings.TrimSpace(path)))
		validPaths = append(validPaths, filepath.ToSlash(rel))
	}

	tkRes.Token = utils.GenerateToken()

	sessionLock.Lock()
	sessionStore[tkRes.Token] = validPaths
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

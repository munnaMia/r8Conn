package handler

import (
	"net/http"

	"github.com/munnaMia/r8Conn/web"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.Handle("GET /", http.FileServerFS(web.FS))
	mux.Handle("POST /files", http.HandlerFunc(h.uploadFiles))
	mux.Handle("GET /files", http.HandlerFunc(h.getFiles))
	mux.Handle("POST /getDownloadToken", http.HandlerFunc(h.getDownloadToken))
	mux.Handle("GET /filesTree", http.HandlerFunc(h.getFilesInfo))
	mux.Handle("GET /recentShares", http.HandlerFunc(h.getRecentShares))
	mux.Handle("GET /configs", http.HandlerFunc(h.getConfigs))
}

package handler

import (
	"net/http"

	"github.com/munnaMia/r8Conn/web"
)

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.Handle("GET /", http.FileServerFS(web.FS))
}

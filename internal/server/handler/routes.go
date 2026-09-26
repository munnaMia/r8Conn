package handler

import "net/http"

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.Handle("GET /", http.HandlerFunc(h.home))
}

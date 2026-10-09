package handler

import "net/http"

func (h *Handler) home(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("welcome to r8Conn"))
}

func (h *Handler) uploadFiles(w http.ResponseWriter, r *http.Request) {

}

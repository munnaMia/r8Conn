package handler

type DownloadRequest struct {
	Paths []string `json:"paths"`
}

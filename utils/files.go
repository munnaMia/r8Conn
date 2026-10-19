package utils

import (
	"log/slog"
	"os"
	"path/filepath"
)

type Directory struct {
	Name        string      `json:"name"`
	Path        string      `json:"path"`
	Files       []File      `json:"files"`
	Directories []Directory `json:"directories"`
}

type File struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Size int64  `json:"size"`
}

// return the file & dir tree for an given path.
func GetFileTree(path string) []Directory {
	dir := make([]Directory, 0)

	return dir
}

// return the download path of user system
func GetDownloadsPath(baseDir string) (string, error) {
	downloadDir := filepath.Join(baseDir, "Downloads", "r8Conn")

	err := os.MkdirAll(downloadDir, 0755)
	if err != nil {
		return "", err
	}

	return downloadDir, nil
}

// return bool if a given path is a directory and exists and return the full path
func IsDir(baseDir, path string) (string, bool) {
	filePath := filepath.Join(baseDir, path)

	info, err := os.Stat(filePath)
	if err != nil {
		slog.Error("failed to check path", "error", err)
		return "", false
	}

	return filePath, info.IsDir()
}

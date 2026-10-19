package utils

import (
	"log/slog"
	"os"
	"path/filepath"
)

// return the download path of system
func GetDownloadsPath(baseDir string) (string, error) {
	downloadDir := filepath.Join(baseDir, "Downloads", "r8Conn")

	err := os.MkdirAll(downloadDir, 0755)
	if err != nil {
		return "", err
	}

	return downloadDir, nil
}

// return bool if a given path is a directory and exists
func IsDir(baseDir, path string) bool {
	filePath := filepath.Join(baseDir, path)

	info, err := os.Stat(filePath)
	if err != nil {
		slog.Error("failed to check path", "error", err)
		return false
	}

	return info.IsDir()
}

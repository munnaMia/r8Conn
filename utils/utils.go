package utils

import (
	"os"
	"path/filepath"
)

// return the download path of system
func GetDownloadsPath() (string, error) {
	hmDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	downloadDir := filepath.Join(hmDir, "Downloads", "r8Conn")

	err = os.MkdirAll(downloadDir, 0755)
	if err != nil {
		return "", err
	}

	return downloadDir, nil
}

// return bool if a given path is a directory and exists
func IsDir(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return info.IsDir()
	}

	return false
}

package utils

import (
	"os"
	"path/filepath"
)

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

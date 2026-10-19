package utils

import (
	"errors"
	"io/fs"
	"log/slog"
	"os"
	"path/filepath"
)

type File struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Size int64  `json:"size"`
}

// return the file & dir tree for an given path.
func GetFileTree(root string) ([]File, error) {
	info, err := os.Stat(root)
	if err != nil {
		slog.Error("failed to check path", "error", err)
		return nil, err
	}

	if !info.IsDir() {
		return nil, errors.New("give path is not a directory")
	}

	files := make([]File, 0)

	err = filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		if !d.IsDir() {
			relPath, _ := filepath.Rel(root, path)
			f, _ := d.Info()

			files = append(files, File{
				Name: d.Name(),
				Path: relPath,
				Size: f.Size(),
			})
		}

		return nil
	})

	return files, nil
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
	newPath := filepath.Join(baseDir, path)

	info, err := os.Stat(newPath)
	if err != nil {
		slog.Error("failed to check path", "error", err)
		return "", false
	}

	return newPath, info.IsDir()
}

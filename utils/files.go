package utils

import (
	"errors"
	"io/fs"
	"log/slog"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type File struct {
	Id   int    `json:"id"`
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
	customId := 0

	err = filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		if !d.IsDir() {
			relPath, _ := filepath.Rel(root, path)
			f, _ := d.Info()

			files = append(files, File{
				Id:   customId,
				Name: d.Name(),
				Path: relPath,
				Size: f.Size(),
			})
			customId++
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

// return a unique name if current one already taken
func GetUniqueFileName(name string, nameMap map[string]bool) string {
	if !nameMap[name] {
		return name
	}

	ext := filepath.Ext(name)
	base := strings.TrimSuffix(name, ext)

	for i := 2; ; i++ {
		canbe := base + "(" + strconv.Itoa(i) + ")" + ext

		if !nameMap[canbe] {
			return canbe
		}
	}
}

// resolve and validate path and return an valid path with file info
func ResolvePath(dirPath, rawPath string) (string, os.FileInfo, error) {
	rawPath = strings.TrimSpace(rawPath)
	if rawPath == "" || strings.Contains(rawPath, `\`) {
		return "", nil, errors.New("invalid file path")
	}

	root, err := filepath.Abs(dirPath)
	if err != nil {
		return "", nil, err
	}

	root, err = filepath.EvalSymlinks(root)
	if err != nil {
		return "", nil, err
	}

	rootInfo, err := os.Stat(root)
	if err != nil || !rootInfo.IsDir() {
		return "", nil, errors.New("no directectory exist with this name")
	}

	rel := filepath.Clean(filepath.FromSlash(rawPath))

	if filepath.IsAbs(rel) ||
		rel == "." ||
		rel == ".." ||
		filepath.VolumeName(rel) != "" ||
		strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", nil, errors.New("path excapes directory")
	}

	fullPath := filepath.Join(root, rel)

	relative, err := filepath.Rel(root, fullPath)
	if err != nil ||
		filepath.IsAbs(relative) ||
		rel == ".." ||
		strings.HasPrefix(relative, ".."+string(filepath.Separator)) {
		return "", nil, errors.New("path excapes directory")
	}

	resolved, err := filepath.EvalSymlinks(fullPath)
	if err != nil {
		return "", nil, err
	}

	relative, err = filepath.Rel(root, resolved)
	if err != nil ||
		filepath.IsAbs(relative) ||
		rel == ".." ||
		strings.HasPrefix(relative, ".."+string(filepath.Separator)) {
		return "", nil, errors.New("path excapes directory")
	}

	info, err := os.Stat(resolved)
	if err != nil {
		return "", nil, err
	}

	if !info.Mode().IsRegular() {
		return "", nil, errors.New("selected path is not a regular file")
	}

	return resolved, info, nil
}

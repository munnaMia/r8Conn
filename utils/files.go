package utils

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

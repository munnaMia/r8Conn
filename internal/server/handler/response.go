package handler

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

type ErrorResponse struct {
	Msg    string `json:"msg"`
	Status int    `json:"status"`
}

type SuccessResponse struct {
	Msg    string `json:"msg"`
	Data   any    `json:"data"`
	Status int    `json:"status"`
}

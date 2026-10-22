package handler

type SuccessResponse struct {
	Msg    string `json:"msg"`
	Data   any    `json:"data"`
	Status int    `json:"status"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

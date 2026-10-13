package handler

import "github.com/munnaMia/r8Conn/internal/config"

type Handler struct {
	config *config.Config
}

func NewHandler(cfg *config.Config) *Handler {
	return &Handler{
		config: cfg,
	}
}

package handler

import (
	"database/sql"

	"github.com/munnaMia/r8Conn/internal/config"
)

type Handler struct {
	db     *sql.DB
	config *config.Config
}

func NewHandler(db *sql.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:     db,
		config: cfg,
	}
}

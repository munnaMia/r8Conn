package gui

import (
	"context"

	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/server/handler"
)

type App struct {
	ctx     context.Context
	handler *handler.Handler
	config  *config.Config
}

// NewApp creates a new App application struct
func NewApp(h *handler.Handler, cfg *config.Config) *App {
	return &App{
		handler: h,
		config:  cfg,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

package cmd

import (
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/cli"
	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/server/handler"
	"github.com/munnaMia/r8Conn/internal/tui"
	"github.com/munnaMia/r8Conn/utils"
)

func Run() {
	// fetch default config
	cfg := config.NewConfig()

	// initialze cli flags
	cli.ParseFlags(cfg)

	// setup a new logger for the application
	lg, cleanUp, err := utils.NewLogger(cfg)
	if err != nil {
		slog.Error("failed to initialized logger", "error", err)
		return
	}
	defer cleanUp()
	slog.SetDefault(lg)

	// get a default storage location to store uploaded file. if not provided
	if cfg.StorageDir == "" {
		cfg.StorageDir, err = utils.GetDownloadsPath()
		if err != nil {
			slog.Error("failed to get a download path", "error", err)
			return
		}
	}

	// initialized a new application handler
	h := handler.NewHandler(cfg)

	if cfg.CLI {
		// start the TUI mode
		if err := tui.Run(h, cfg); err != nil {
			slog.Error("Failed to run TUI", "error", err)
			return
		}
	} else {
		// run the GUI mode
	}

}

package cmd

import (
	"fmt"
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/cli"
	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/server/handler"
	"github.com/munnaMia/r8Conn/internal/tui"
	"github.com/munnaMia/r8Conn/util/logger"
)

func Run() {
	// fetch default config
	cfg := config.NewConfig()

	// initialze cli flags
	cli.ParseFlags(cfg)

	// setup a new logger for the application
	lg, cleanUp, err := logger.NewLogger(cfg)
	if err != nil {
		slog.Error("failed to initialized logger", "error", err)
		return
	}
	defer cleanUp()
	slog.SetDefault(lg)

	// initialized a new application handler
	h := handler.NewHandler()

	if cfg.CLI {
		// run the CLI mode
		slog.Info("start the cli mode of r8Conn")
		fmt.Println(cfg.Debug) // temp remove letter...

		// start the TUI version
		tui.Run(h, cfg)
	} else {
		// run the GUI mode
	}

}

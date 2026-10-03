package cmd

import (
	"fmt"
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/cli"
	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/network"
	"github.com/munnaMia/r8Conn/internal/server"
	"github.com/munnaMia/r8Conn/internal/server/handler"
	"github.com/munnaMia/r8Conn/util/logger"
)

func Run() {
	// setup a new logger for the application
	lg := logger.NewLogger(false, false)
	slog.SetDefault(lg)

	// fetch default config
	cfg := config.NewConfig()

	// initialze cli flags
	cli.ParseFlags(cfg)

	// fetch the ip and port
	err := network.InitializeAddr(cfg)
	if err != nil {
		slog.Error("failed to initialized network ip and port", "error", err)
		return
	}

	// initialized a new application handler
	h := handler.NewHandler()

	// setup a new http server for application
	addr := network.FormatBindPort(cfg.Port)

	server := server.NewServer(h, addr)

	if cfg.Headless {
		// run the CLI mode
		slog.Info("start the cli mode of r8Conn")
		fmt.Println(cfg) // temp remove letter...

		// start the http server on a separate go routine
		server.Start()

	} else {
		// run the GUI mode
	}

}

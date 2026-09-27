package cmd

import (
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/cli"
	"github.com/munnaMia/r8Conn/internal/config"
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

	// initialized a new application handler
	h := handler.NewHandler()

	// setup a new http server for application
	server := server.NewServer(h, ":8080")

	// start the http server
	server.Start()
}

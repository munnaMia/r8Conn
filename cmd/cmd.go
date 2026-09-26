package cmd

import (
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/server"
	"github.com/munnaMia/r8Conn/internal/server/handler"
	"github.com/munnaMia/r8Conn/util/logger"
)

func Run() {
	// setup a new logger for the application
	lg := logger.NewLogger(false, false)
	slog.SetDefault(lg)

	// initialized a new application handler
	h := handler.NewHandler()

	// setup a new http server for application
	server := server.NewServer(h)

	// start the http server
	server.Start()
}

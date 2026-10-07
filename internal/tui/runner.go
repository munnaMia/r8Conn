package tui

import (
	"log/slog"

	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/network"
	"github.com/munnaMia/r8Conn/internal/server"
	"github.com/munnaMia/r8Conn/internal/server/handler"
)

// Run the terminal user interface.
func Run(h *handler.Handler, cfg *config.Config) {
	// fetch the ip and port
	err := network.InitializeAddr(cfg)
	if err != nil {
		slog.Error("failed to initialized network ip and port", "error", err)
		return // with out wifi the app breaks here...
	}

	// setup a new http server for application
	addr := network.FormatBindPort(cfg.Port)

	server := server.NewServer(h, addr)

	// start the http server on a separate go routine
	server.Start()
}

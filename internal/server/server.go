package server

import (
	"log/slog"
	"net/http"

	"github.com/munnaMia/r8Conn/internal/server/handler"
)

type Server struct {
	Handler *handler.Handler
	Addr    string
}

func NewServer(h *handler.Handler, addr string) *Server {
	return &Server{
		Handler: h,
		Addr:    addr,
	}
}

func (svr *Server) Start() {
	mux := http.NewServeMux()

	// register application http server routes
	svr.Handler.RegisterRoutes(mux)

	httpServer := &http.Server{
		Addr: svr.Addr,
	}

	slog.Info("Starting the HTTP service", "PORT", svr.Addr)
	if err := httpServer.ListenAndServe(); err != nil {
		slog.Error("server failed to start", "error", err)
		return
	}
}

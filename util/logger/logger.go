package logger

import (
	"log/slog"
	"os"
)

func NewLogger(isProd, addr bool) *slog.Logger {
	level := slog.LevelDebug

	if isProd {
		level = slog.LevelInfo
		addr = false
	}

	opts := &slog.HandlerOptions{
		Level:     level,
		AddSource: addr,
	}

	var handler slog.Handler
	if isProd {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}

package logger

import (
	"io"
	"log/slog"
	"os"

	"github.com/munnaMia/r8Conn/internal/config"
)

func NewLogger(cfg *config.Config) (*slog.Logger, func(), error) {
	level := slog.LevelDebug

	// set env for production
	if !cfg.Debug {
		level = slog.LevelInfo
		cfg.AddSource = false
	}

	opts := &slog.HandlerOptions{
		Level:     level,
		AddSource: cfg.AddSource,
	}

	var handler slog.Handler
	var writer io.Writer
	cleanUp := func() {}

	if cfg.Debug {
		writer = os.Stdout
		handler = slog.NewTextHandler(writer, opts)
		return slog.New(handler), cleanUp, nil
	}

	f, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		writer = io.Discard
	} else {
		writer = f
		cleanUp = func() {
			_ = f.Close()
		}
	}

	handler = slog.NewJSONHandler(writer, opts)

	return slog.New(handler), cleanUp, nil
}

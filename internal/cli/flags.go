package cli

import (
	"flag"

	"github.com/munnaMia/r8Conn/internal/config"
)

func ParseFlags(cfg *config.Config) {
	flag.IntVar(&cfg.Port, "p", cfg.Port, "Port to run the http fileserver")
	flag.StringVar(&cfg.PreferredIP, "ip", "", "Manually specify the local IP address. Default IP is empty string and application will find valid one")
	flag.StringVar(&cfg.ShareDir, "sd", cfg.PreferredIP, "Directory path to serve the files to share")
	flag.BoolVar(&cfg.Headless, "hl", cfg.Headless, "Run in Headless TUI/CLI mode without GUI")

	flag.Parse()
}

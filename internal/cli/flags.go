package cli

import (
	"flag"

	"github.com/munnaMia/r8Conn/internal/config"
)

func ParseFlags(cfg *config.Config) {
	flag.IntVar(&cfg.Port, "p", cfg.Port, "Port to run the http fileserver. \n default is :0 mean OS will provide one")
	flag.StringVar(&cfg.PreferredIP, "ip", "", "Manually specify the local IP address. \nDefault IP is empty string and application will find valid one")
	flag.StringVar(&cfg.ShareDir, "sd", cfg.PreferredIP, "Directory path to serve the files to share")
	flag.BoolVar(&cfg.CLI, "cli", cfg.CLI, "Run in Headless TUI/CLI mode without GUI.")
	flag.BoolVar(&cfg.AddSource, "ads", cfg.AddSource, "Add a SourceKey attribute to the output")
	flag.BoolVar(&cfg.Debug, "debug", cfg.Debug, "Exicute on debug mode")

	flag.Parse()
}

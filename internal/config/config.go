package config

import "github.com/mdp/qrterminal/v4"

type Config struct {
	Port        int
	PreferredIP string
	ShareDir    string
	CLI         bool
	AddSource   bool
	Debug       bool
	QrConfig    *qrterminal.Config
}

// NewConfig return an instance of config struct with some default values
func NewConfig() *Config {
	return &Config{
		Port:        0,
		PreferredIP: "",
		ShareDir:    ".",
		CLI:         false,
		AddSource:   false,
		Debug:       false,
		QrConfig: &qrterminal.Config{
			Level:     qrterminal.L,
			WhiteChar: qrterminal.WHITE_WHITE,
			BlackChar: qrterminal.BLACK_BLACK,
			QuietZone: 1,
			HalfBlocks: true,
		},
	}
}

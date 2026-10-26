package config

import (
	"github.com/mdp/qrterminal/v4"
)

type Config struct {
	Port        int                `json:"port"`
	PreferredIP string             `json:"ip"`
	BaseDir     string             `json:"-"`
	ShareDir    string             `json:"shareDir"`
	StorageDir  string             `json:"storageDir"`
	AddSource   bool               `json:"-"`
	Debug       bool               `json:"-"`
	QrConfig    *qrterminal.Config `json:"-"`
}

// NewConfig return an instance of config struct with some default values
func NewConfig() *Config {
	return &Config{
		Port:        0,
		PreferredIP: "",
		ShareDir:    "",
		StorageDir:  "",
		AddSource:   false,
		Debug:       false,
		QrConfig: &qrterminal.Config{
			Level:      qrterminal.L,
			WhiteChar:  qrterminal.WHITE_WHITE,
			BlackChar:  qrterminal.BLACK_BLACK,
			QuietZone:  1,
			HalfBlocks: true,
		},
	}
}

package config

type Config struct {
	Port        int
	PreferredIP string
	ShareDir    string
	CLI         bool
	AddSource   bool
	Debug       bool
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
	}
}

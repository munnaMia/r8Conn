package config

type Config struct {
	Port        int
	PreferredIP string
	Headless    bool
	ShareDir    string
}

// NewConfig return an instance of config struct with some default values
func NewConfig() *Config {
	return &Config{
		Port:     0,
		Headless: false,
		ShareDir: ".",
	}
}

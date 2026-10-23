package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// return a 16 bytes random hex string
func GenerateToken() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

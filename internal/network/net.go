package network

import (
	"net"
	"strings"
)

// GetLocalIP function return the local ip address of your device that is currently
// available for connect and it remove the port address from the ip. e.g. 192.168.0.1:99
// to 192.168.0.1
func GetLocalIP() (string, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "", err
	}

	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)
	ip, _, _ := strings.Cut(localAddr.String(), ":")

	return ip, nil
}

package network

import (
	"fmt"
	"net"
	"strconv"
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

// // GetPortAddr find a available port and return it.
// func GetPortAddr() string {
// 	return ""
// }

// check the port is available for use or not
func IsLocalPortAvailable(port int) (bool, error) {
	ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
	if err != nil {
		return false, fmt.Errorf("port is not available. %w", err)
	}
	defer ln.Close()

	return true, nil
}

// // check the local IP is available for use or not
// func IsLocalIPAvailable(ip string) (bool, error) {
// 	return false, nil
// }

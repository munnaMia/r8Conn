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
func PortAvailable(port int) (bool, error) {
	ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
	if err != nil {
		return false, fmt.Errorf("port is not available. %w", err)
	}
	defer ln.Close()

	return true, nil
}

// check the local IP is available for use or not
func ValidateIP(ip string) error {
	netIp := net.ParseIP(ip)
	if netIp == nil {
		return fmt.Errorf("provided IP is not a valid IP address")
	}

	if netIp.IsLoopback() {
		return fmt.Errorf("loopback ip is not allowed. %s", netIp.String())
	}

	interfaces, err := net.Interfaces()
	if err != nil {
		return fmt.Errorf("failed to fetch all the interfaces on local matchine. %w", err)
	}

	for _, iface := range interfaces {
		addrs, err := iface.Addrs()
		if err != nil {
			return fmt.Errorf("failed to retriving address for interface %s : %w", iface.Name, err)
		}

		for _, addr := range addrs {
			ipNet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}

			if ipNet.IP.Equal(netIp) {
				return nil
			}
		}

	}

	return fmt.Errorf("IP address %s is not assigned to this machine", ip)
}

package network

import (
	"fmt"
	"net"
	"strconv"
	"strings"

	"github.com/munnaMia/r8Conn/internal/config"
)

// check user provided ip and port are valid or not and return error. if configuration hold default values then it assing ip and port on it
func InitializeAddr(cfg *config.Config) error {

	// validate user provided port address
	if cfg.Port != 0 {
		err := ValidatePort(cfg.Port)
		if err != nil {
			return err
		}
		return nil
	}

	// validate user provided ip address
	if cfg.PreferredIP != "" {
		err := ValidateIP(cfg.PreferredIP)
		if err != nil {
			return err
		}
		return nil
	}

	// get an ip and port for http file server
	var err error

	cfg.Port, err = GetLocalPort(cfg.Port)
	if err != nil {
		return err
	}

	cfg.PreferredIP, err = GetLocalIP()
	if err != nil {
		return err
	}

	return nil
}

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

// GetPortAddr find a available port and return it or check a given port is available or not.
func GetLocalPort(port int) (int, error) {
	// do a tcp req for port :0 to find a port...
	ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
	if err != nil {
		return 0, fmt.Errorf("failed to established a connection on port %d. %w", port, err)
	}
	defer ln.Close()

	p := ln.Addr().(*net.TCPAddr).Port
	return p, nil
}

// check the given port is available for use or not
func ValidatePort(port int) error {
	ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
	if err != nil {
		return fmt.Errorf("port :%d is not available. %w", port, err)
	}
	defer ln.Close()

	return nil
}

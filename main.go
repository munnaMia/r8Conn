package cmd

import (
	"fmt"
	"net"
)

func GetLocalIP() (string, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "", err
	}

	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr).String()

	return localAddr, nil
}

func main() {
	ip, err := GetLocalIP()
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(ip)
}

package main

import (
	"fmt"

	"github.com/munnaMia/r8Conn/internal/network"
)

func main() {
	// cmd.Run()
	fmt.Println(network.ValidateIP("192.168.43.83"))
}

package main

import (
	"fmt"
	"net/http"

	"github.com/munnaMia/r8Conn/internal/network"
)

func main() {
	ip, err := network.GetLocalIP()
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(ip)

	fmt.Println("starting an http server")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello men..."))
	})
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}

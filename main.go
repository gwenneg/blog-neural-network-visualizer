package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type WsMessage struct {
	Command string `json:"command"`
	Payload any    `json:"payload"`
}

var upgrader = websocket.Upgrader{}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.HandleFunc("/neural-network-visualizer", wsHandler)
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func mockActivations(networkDef []int) [][]float32 {
	activations := make([][]float32, len(networkDef))
	for i, layerSize := range networkDef {
		activations[i] = make([]float32, layerSize)
		for j := range activations[i] {
			if i == 0 {
				activations[i][j] = 1
			} else {
				activations[i][j] = rand.Float32()
			}
		}
	}
	return activations
}

func sendWsMessage(conn *websocket.Conn, command string, payload any) {
	msg := WsMessage{command, payload}
	if err := conn.WriteJSON(msg); err != nil {
		log.Println(err)
		return
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	defer func(conn *websocket.Conn) {
		if err := conn.Close(); err != nil {
			log.Println(err)
		}
	}(conn)

	var payload json.RawMessage
	request := &WsMessage{
		Payload: &payload,
	}

	var networkDef []int

	stopChan := make(chan bool)

	for {

		if err := conn.ReadJSON(&request); err != nil {
			log.Println(err)
			return
		}

		switch request.Command {

		case "init":
			if payload == nil {
				sendWsMessage(conn, "error", "The `payload` field is required in an `init` request")
			} else {
				if err := json.Unmarshal(payload, &networkDef); err != nil {
					log.Println(err)
					sendWsMessage(conn, "error", "The `payload` field couldn't be parsed")
				} else {
					sendWsMessage(conn, "network-def", networkDef)
				}
			}

		case "start":
			go func() {
				ticker := time.NewTicker(200 * time.Millisecond)
				for {
					select {
					case <-stopChan:
						ticker.Stop()
						return
					case <-ticker.C:
						activations := mockActivations(networkDef)
						sendWsMessage(conn, "activations", activations)
					}
				}
			}()

		case "stop":
			stopChan <- true

		default:
			log.Printf("Unexpected command: %s", request.Command)
		}
	}
}

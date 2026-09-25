# r8Conn

**r8Conn** is an ultra-fast, lightweight, cross-platform file transfer tool written in Go. It enables seamless file sharing between mobile devices and laptops/PCs over local Wi-Fi or mobile hotspots without requiring internet connectivity or installing third-party apps on your phone.

---

## 🌟 Key Features

- **Zero Mobile Apps Needed:** Connects directly through your phone's built-in web browser via a locally hosted HTTP server.
- **Dual-Mode Engine:** Runs seamlessly as a headless **CLI tool** in the terminal or as a native **Desktop Application** powered by Wails.
- **Offline & High Speed:** Transfers files at maximum Wi-Fi Direct / Hotspot network speeds without consuming cellular data.
- **Terminal & GUI QR Codes:** Automatically generates a local QR code for instant phone browser scanning.
- **Bidirectional Transfer:** Stream files from Laptop $\rightarrow$ Mobile or upload files from Mobile $\rightarrow$ Laptop effortlessly.
- **Memory Efficient:** Engineered with Go streaming protocols (`io.Copy`) to handle multi-gigabyte files with minimal RAM utilization.

---

## 🛠️ Tech Stack

- **Core Engine:** Go (Golang) standard library (`net`, `net/http`, `io`, `os`)
- **Desktop GUI:** [Wails v2](https://wails.io/) (Go + HTML/CSS/JS)
- **Cross-Platform:** Windows, macOS, and Linux

---

## 🚀 Quick Start & Usage

### 1. Network Connection
Ensure both your laptop and phone are on the same local network:
- Connect both devices to the same Wi-Fi router, **OR**
- Enable **Mobile Hotspot** on your phone (Data OFF) and connect your laptop to it.

### 2. Running the Application

#### **Desktop Mode (GUI)**
Double-click the compiled `r8Conn` executable. A desktop interface will open displaying:
1. An auto-generated QR code.
2. A local network link (e.g., `http://192.168.1.15:8080`).
3. Drag-and-drop zone for instant staging.

#### **CLI Mode (Terminal)**
To run headless inside your terminal:
```bash
./r8Conn --cli
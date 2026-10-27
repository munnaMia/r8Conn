<div style="display: flex; flex-direction: column; padding: 20px; background-color: #f5f5f5; border-radius:10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
<div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
<span style="color: #333; font-family: Arial, sans-serif; font-size: 4em;"> r8Conn </span>
<img src="web/assets/logo/r8Conn.png" style="border-radius:40%;" alt="r8Conn Logo" width="50"/>

</div>
<p style="color: #555; font-family: Arial, sans-serif; font-size: 0.9rem; line-height: 1.5; margin-right: 20px;">
<strong>r8Conn</strong> is an ultra-fast, lightweight, cross-platform file transfer cli tool written in Go. It enables seamless file sharing between mobile devices and laptops/PCs over local Wi-Fi or mobile hotspots without requiring internet connectivity or installing third-party apps on your phone.
</p>
</div>

---

## 🌟 Key Features

- **Zero Mobile Apps Needed:** Connects directly through your phone's built-in web browser via a locally hosted HTTP server.
- **Offline & High Speed:** Transfers files at maximum Wi-Fi Direct / Hotspot network speeds without consuming cellular data.
- **Terminal UI:** Automatically generates a local QR code for instant phone browser scanning.
- **Bidirectional Transfer:** Stream files from Laptop $\rightarrow$ Mobile or upload files from Mobile $\rightarrow$ Laptop effortlessly.
- **Memory Efficient:** Engineered with Go streaming protocols to handle multi-gigabyte files with minimal RAM utilization.
---

## 🛠️ Tech Stack

- **Core Engine:** Go (Golang) standard library (`net`, `net/http`, `io`, `os`)
- **QR Code Generation:** [go-qrcode](https://github.com/skip2/go-qrcode)
- **File Transfer Protocol:** HTTP/HTTPS with streaming support
- **CLI Framework:** [bubbletea/cli](https://github.com/charmbracelet/bubbletea), lipgloss for terminal UI
- **Database:** sqlite for storing transfer history.

---

## 🚀 Quick Start & Usage

### 1. Network Connection

Ensure both your laptop and phone are on the same local network:

- Connect both devices to the same Wi-Fi router, **OR**
- Enable **Mobile Hotspot** on your phone (Data OFF) and connect your laptop wifi to it.

### 2. Running the Application

#### **CLI Mode (Terminal)**

To run headless inside your terminal:

```bash
# Start the application with default settings (OS-assigned IP & port)
./r8Conn

# or try with 8080 port
./r8Conn -p 8080
```

#### **All the CLI Flags and their usage**

```bash
# Start with default settings (OS-assigned ip & port)
./r8Conn

# See all available options and help
./r8Conn --help

# Start with a custom port (e.g., 8080)
./r8Conn -p 8080

# Start with a custom IP address (e.g.,
./r8Conn -ip 192.168.1.100

# Select dirctory to share file from (e.g., Downloads folder)
./r8Conn -dwd Downloads 

# Directory path to store uploaded files on the host (Upload directory). default is the Downloads/r8Conn if not exists cli create the directory
./r8Conn -uwd Downloads/Uploads

# Include the source address in the console/output display.
./r8Conn -ads	

# Execute the application in debug mode for verbose logging.
./r8Conn -debug	
```

## Notes: 

- **PORT:** If you encounter a "port already in use" error, try specifying a different port using the `-p` flag.
- **IP ADDRESS:** If your laptop has multiple network interfaces, you can specify the desired IP address using the `-ip` flag.
- **DIRECTORY:** <p style="color: red; display: inline;">Keep in mind provide direcories that exist on use use home directory. or leave empty app will create or find /Downloads/r8Conn. </p>Use the `-dwd` flag to specify the directory from which files will be shared. The `-uwd` flag allows you to set the directory where uploaded files will be stored on the host machine.

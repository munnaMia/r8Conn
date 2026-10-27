package db

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type TransferRecord struct {
	Id        int    `json:"id"`
	DeviceId  string `json:"deviceId"`
	FileName  string `json:"fileName"`
	FileIcon  string `json:"fileIcon"`
	FileSize  int64  `json:"fileSize"`
	Direction string `json:"direction"`
	Timestamp string `json:"timeStamp"`
}

// InitDB initializes the SQLite database and runs table migrations
func InitDB() (*sql.DB, error) {
	confidDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	dbDir := filepath.Join(confidDir, "r8Conn")
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create a config directory. %w", err)
	}

	dbPath := filepath.Join(dbDir, "r8conn.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to established a sqlite connection. %w", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping a sqlite database. %w", err)
	}

	if err = createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables. %w", err)
	}

	return db, nil
}

// create necessary tables if not exist
func createTables(db *sql.DB) error {
	// direction can be 'UPLOAD' or 'DOWNLOAD'
	query := `
	CREATE TABLE IF NOT EXISTS devices (
		id TEXT PRIMARY KEY,
		name TEXT DEFAULT 'unknown device',
		last_ip TEXT,
		last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS transfers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		deviceId TEXT,
		fileName TEXT,
		fileSize INTEGER,
		fileIcon TEXT,
		direction TEXT,
		timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
	);
	`
	_, err := db.Exec(query)
	return err
}

// insert history
func CreateTransfer(db *sql.DB, direction, deviceId, clientIp, filename, fileIcon string, filesize int64) {
	_, _ = db.Exec(`
		INSERT INTO devices (id, last_ip, last_seen)
		VALUES (?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			last_ip = excluded.last_ip,
			last_seen = CURRENT_TIMESTAMP`,
		deviceId,
		clientIp,
	)

	_, _ = db.Exec(`
		INSERT INTO transfers (deviceId, fileName, fileSize, fileIcon, direction)
		VALUES (?, ?, ?, ?, ?)`,
		deviceId, filename, filesize, fileIcon, direction)
}

// get recent files that transfer history
func GetTransfers(db *sql.DB, deviceId, direction string) ([]TransferRecord, error) {
	query := `
	SELECT id, deviceId, fileName, fileSize, fileIcon, direction, timeStamp
	FROM (
		SELECT id, deviceId, fileName, fileSize, fileIcon, direction, timeStamp
		FROM transfers
		WHERE deviceId = ? AND direction = ?
		ORDER BY timestamp DESC
		LIMIT 15
	)
	ORDER BY timestamp ASC;
	`

	rows, err := db.Query(query, deviceId, direction)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []TransferRecord
	for rows.Next() {
		var rec TransferRecord
		if err := rows.Scan(
			&rec.Id,
			&rec.DeviceId,
			&rec.FileName,
			&rec.FileSize,
			&rec.FileIcon,
			&rec.Direction,
			&rec.Timestamp,
		); err != nil {
			slog.Error("failed to get record", "error", err)
			continue
		}

		history = append(history, rec)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("itterating history error %w", err)
	}

	return history, nil
}

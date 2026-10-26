package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
)

// InitDB initializes the SQLite database and runs table migrations
func InitDB(basePath string) (*sql.DB, error) {
	dbDir := filepath.Join(basePath, "./config", "r8Conn")
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
func createTables(db *sql.DB) error {}

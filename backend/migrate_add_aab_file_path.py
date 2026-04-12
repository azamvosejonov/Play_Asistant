#!/usr/bin/env python3
import sqlite3

db_path = "data/play_deploy.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(apps)")
columns = [col[1] for col in cursor.fetchall()]

if "aab_file_path" not in columns:
    print("Adding aab_file_path column to apps table...")
    cursor.execute("ALTER TABLE apps ADD COLUMN aab_file_path TEXT")
    conn.commit()
    print("Column added successfully!")
else:
    print("Column aab_file_path already exists.")

conn.close()

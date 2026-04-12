#!/usr/bin/env python3
import sqlite3

db_path = "data/play_deploy.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(apps)")
columns = [col[1] for col in cursor.fetchall()]

# Columns to add
columns_to_add = [
    ("aab_file_path", "TEXT"),
    ("aab_version_code", "INTEGER"),
    ("aab_version_name", "TEXT"),
    ("aab_uploaded_at", "DATETIME"),
    ("status", "TEXT DEFAULT 'draft'"),
    ("draft_title", "TEXT"),
    ("draft_short_description", "TEXT"),
    ("draft_full_description", "TEXT"),
    ("draft_language", "TEXT DEFAULT 'en'"),
    ("draft_updated_at", "DATETIME"),
    ("default_language", "TEXT DEFAULT 'en-US'"),
    ("contact_email", "TEXT"),
]

for col_name, col_type in columns_to_add:
    if col_name not in columns:
        print(f"Adding {col_name} column to apps table...")
        cursor.execute(f"ALTER TABLE apps ADD COLUMN {col_name} {col_type}")
        conn.commit()
        print(f"Column {col_name} added successfully!")
    else:
        print(f"Column {col_name} already exists.")

conn.close()

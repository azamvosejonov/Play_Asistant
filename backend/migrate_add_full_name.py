import sqlite3
from database import engine

# Connect to the database
conn = engine.connect()
connection = conn.connection
cursor = connection.cursor()

try:
    # Check if full_name column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'full_name' not in columns:
        # Add the full_name column
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
        connection.commit()
        print("✅ full_name column added successfully")
    else:
        print("ℹ️ full_name column already exists")
except Exception as e:
    print(f"❌ Error: {e}")
    connection.rollback()
finally:
    connection.close()
    conn.close()

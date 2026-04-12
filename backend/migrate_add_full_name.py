import sqlite3
from database import engine

# Connect to the database
conn = engine.connect()
connection = conn.connection
cursor = connection.cursor()

try:
    # Check existing columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # Add missing columns
    columns_to_add = {
        'full_name': 'TEXT',
        'is_admin': 'BOOLEAN DEFAULT 0',
        'is_active': 'BOOLEAN DEFAULT 1',
        'created_at': 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    }
    
    for column_name, column_def in columns_to_add.items():
        if column_name not in columns:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_def}")
            print(f"✅ {column_name} column added successfully")
        else:
            print(f"ℹ️ {column_name} column already exists")
    
    connection.commit()
    print("✅ Migration completed successfully")
except Exception as e:
    print(f"❌ Error: {e}")
    connection.rollback()
finally:
    connection.close()
    conn.close()

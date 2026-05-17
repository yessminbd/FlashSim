import sqlite3
import os

db_path = 'db.sqlite3'
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Dropping {len(tables)} tables...")
        cursor.execute("PRAGMA writable_schema = 1;")
        cursor.execute("DELETE FROM sqlite_master WHERE type IN ('table', 'index', 'trigger');")
        cursor.execute("PRAGMA writable_schema = 0;")
        conn.commit()
        cursor.execute("VACUUM;")
        conn.close()
        print("Database cleared.")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("db.sqlite3 not found")

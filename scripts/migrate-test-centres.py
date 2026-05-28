#!/usr/bin/env python3
"""
Migrate test centres from DTC database to MoveMyTest database.
"""

import pymysql
import json

# DTC Database Connection
DTC_CONFIG = {
    'host': 'localhost',
    'port': 3307,
    'user': 'dtc_dev',
    'password': 'dtc_dev_pw',
    'database': 'dtc_dev',
    'charset': 'utf8mb4'
}

# MoveMyTest Database Connection
MMT_CONFIG = {
    'host': 'localhost',
    'port': 3309,
    'user': 'root',
    'password': 'mmt_root_2026',
    'database': 'movemytest',
    'charset': 'utf8mb4'
}

def migrate():
    # Connect to DTC
    dtc_conn = pymysql.connect(**DTC_CONFIG)
    dtc_cursor = dtc_conn.cursor(pymysql.cursors.DictCursor)
    
    # Connect to MoveMyTest
    mmt_conn = pymysql.connect(**MMT_CONFIG)
    mmt_cursor = mmt_conn.cursor()
    
    try:
        # Fetch active test centres from DTC
        dtc_cursor.execute("""
            SELECT 
                id, slug, displayName, officialName, region, postcode,
                addressLines, latitude, longitude, createdAt, updatedAt
            FROM TestCentre 
            WHERE active = 1
        """)
        
        centres = dtc_cursor.fetchall()
        print(f"Found {len(centres)} active test centres in DTC")
        
        # Disable foreign key checks temporarily
        mmt_cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # Clear existing data in MoveMyTest
        mmt_cursor.execute("TRUNCATE TABLE TestCentre")
        mmt_conn.commit()
        print("Cleared existing MoveMyTest test centres")
        
        # Re-enable foreign key checks
        mmt_cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        # Insert into MoveMyTest
        insert_sql = """
            INSERT INTO TestCentre 
            (id, slug, name, addressLine1, town, postcode, region, passRate, latitude, longitude, createdAt, updatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        migrated = 0
        for centre in centres:
            # Parse address lines
            address_line1 = None
            if centre['addressLines']:
                try:
                    addr = json.loads(centre['addressLines'])
                    if isinstance(addr, list) and len(addr) > 0:
                        address_line1 = addr[0]
                except:
                    pass
            
            # Use displayName or officialName
            name = centre['displayName'] or centre['officialName'] or centre['slug']
            
            mmt_cursor.execute(insert_sql, (
                centre['id'],
                centre['slug'],
                name,
                address_line1,
                None,  # town
                centre['postcode'],
                centre['region'],
                None,  # passRate
                float(centre['latitude']) if centre['latitude'] else None,
                float(centre['longitude']) if centre['longitude'] else None,
                centre['createdAt'],
                centre['updatedAt']
            ))
            migrated += 1
        
        mmt_conn.commit()
        print(f"Successfully migrated {migrated} test centres")
        
        # Verify
        mmt_cursor.execute("SELECT COUNT(*) FROM TestCentre")
        count = mmt_cursor.fetchone()[0]
        print(f"MoveMyTest now has {count} test centres")
        
    except Exception as e:
        print(f"Error: {e}")
        mmt_conn.rollback()
        raise
    finally:
        dtc_cursor.close()
        dtc_conn.close()
        mmt_cursor.close()
        mmt_conn.close()

if __name__ == '__main__':
    migrate()

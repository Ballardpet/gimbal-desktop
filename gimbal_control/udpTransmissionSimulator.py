# File for making fake P5 Transmissions to test my code
import socket
import struct
import time
import pymap3d as pm

DEST_IP = "127.0.0.1"
DEST_PORT = 3000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Aircraft positions
lat1, lon1, alt1 = 30.490000, -86.540000, 1000.0
lat2, lon2, alt2 = 31.010000, -86.010000, 1200.0
lat3, lon3, alt3 = 30.000, -86.445000, 50.0   # Ground vehicle


def send_entity(callsign, entity_id, lat, lon, alt):
    packet = bytearray(144)

    # --------------------------
    # PDU Header
    # --------------------------
    packet[0] = 6
    packet[1] = 95
    packet[2] = 1
    packet[3] = 1

    struct.pack_into(">I", packet, 4, 0)
    struct.pack_into(">H", packet, 8, 144)
    struct.pack_into(">H", packet, 10, 0)

    # --------------------------
    # Entity Identifier
    # --------------------------
    struct.pack_into(">H", packet, 12, 1)
    struct.pack_into(">H", packet, 14, 1)
    struct.pack_into(">H", packet, 16, entity_id)

    # --------------------------
    # Force Info
    # --------------------------
    packet[18] = 1
    packet[19] = 0

    # --------------------------
    # Entity Type
    # --------------------------
    packet[20] = 1
    packet[21] = 2
    struct.pack_into(">H", packet, 22, 225)
    packet[24] = 1
    packet[25] = 0
    packet[26] = 0
    packet[27] = 0

    # --------------------------
    # Location (ECEF)
    # --------------------------
    x, y, z = pm.geodetic2ecef(lat, lon, alt)

    struct.pack_into(">d", packet, 48, x)
    struct.pack_into(">d", packet, 56, y)
    struct.pack_into(">d", packet, 64, z)

    # --------------------------
    # Entity Marking
    # --------------------------
    packet[128] = 1
    packet[129:129 + len(callsign)] = callsign.encode("ascii")

    sock.sendto(packet, (DEST_IP, DEST_PORT))

    print(f"Sent {callsign}: {lat:.6f}, {lon:.6f}, {alt:.1f}")


while True:

    # Aircraft 1 (flies north)
    send_entity("CALLSGN1", 1, lat1, lon1, alt1)

    # Aircraft 2 (flies east)
    send_entity("CALLSGN2", 2, lat2, lon2, alt2)

    # Ground vehicle (stationary)
    send_entity("GND1", 3, lat3, lon3, alt3)

    # Move the aircraft
    lat1 += 0.00005      # North
    lon2 += 0.00005      # East

    time.sleep(0.5)
-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Supported Protocols
CREATE TABLE IF NOT EXISTS supported_protocols (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    default_port INTEGER,
    capabilities JSON DEFAULT '{}',
    parameters JSON DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT TRUE
);

-- Device Types
CREATE TABLE IF NOT EXISTS device_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    compatible_protocols JSON DEFAULT '[]',
    parameter_templates JSON DEFAULT '{}',
    icon TEXT
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    protocol TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown',
    last_seen TIMESTAMP DEFAULT NOW(),
    acceptable_ranges JSON DEFAULT '{}',
    metadata JSON DEFAULT '{}'
);

-- Sensor Data
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    parameter_name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    device_id INTEGER REFERENCES devices(id),
    raw_data JSON DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT FALSE
);

-- Attack Logs
CREATE TABLE IF NOT EXISTS attack_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    attack_type TEXT NOT NULL,
    target_id INTEGER REFERENCES devices(id),
    parameters JSON DEFAULT '{}',
    result TEXT NOT NULL,
    notes TEXT
);

-- Mitigation Guidance
CREATE TABLE IF NOT EXISTS mitigation_guidance (
    id SERIAL PRIMARY KEY,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps JSON NOT NULL,
    severity TEXT NOT NULL
);

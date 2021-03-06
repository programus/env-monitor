CREATE TABLE IF NOT EXISTS env_records (
  device_id TINYINT UNSIGNED NOT NULL,
  unix_time BIGINT NOT NULL,
  temperature FLOAT,
  humidity FLOAT,
  PRIMARY KEY(device_id, unix_time)
);

CREATE VIEW IF NOT EXISTS v_records AS SELECT 
  device_id ,
  unix_time ,
  FROM_UNIXTIME(unix_time / 1000) AS human_time,
  temperature ,
  humidity 
FROM env_records;

CREATE TABLE IF NOT EXISTS errors (
  device_id TINYINT UNSIGNED NOT NULL,
  unix_time BIGINT NOT NULL,
  error VARCHAR(512),
  PRIMARY KEY(device_id, unix_time)
);

CREATE VIEW IF NOT EXISTS v_errors AS SELECT 
  device_id ,
  unix_time ,
  FROM_UNIXTIME(unix_time / 1000) AS human_time,
  error
FROM errors;

CREATE TABLE IF NOT EXISTS vcc_last (
  device_id TINYINT UNSIGNED NOT NULL,
  unix_time BIGINT NOT NULL,
  vcc SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY(device_id)
);

CREATE VIEW IF NOT EXISTS v_vcc_last AS SELECT 
  device_id ,
  unix_time ,
  FROM_UNIXTIME(unix_time / 1000) AS human_time,
  vcc
FROM vcc_last;

CREATE TABLE IF NOT EXISTS m_positions (
  position_id INT UNSIGNED NOT NULL,
  device_id TINYINT UNSIGNED NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  position_name VARCHAR(16) NOT NULL DEFAULT '',
  position_desc VARCHAR(512) NOT NULL DEFAULT '',
  PRIMARY KEY(position_id)
);


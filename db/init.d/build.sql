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
  error ,
FROM errors;


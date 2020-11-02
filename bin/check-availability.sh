#!/usr/bin/env bash

BASE_DIR="$(realpath "$(dirname $0)/..")"
LOG_FILE="${BASE_DIR}/log/check-availability.log"

REMAIN_LINE=1000

# call check availability api
echo "$(date '+%Y-%m-%d %H:%M:%S') - $(curl -X POST http://localhost:3000/api/check-availability -d "{}" -s )" >> "${LOG_FILE}"

# remove old log
echo "$(tail -${REMAIN_LINE} "${LOG_FILE}")" > "${LOG_FILE}"


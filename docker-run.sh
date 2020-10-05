#!/usr/bin/env bash
if uname -m | grep 'armv7'
then
  export DB_IMAGE=tobi312/rpi-mariadb
else
  export DB_IMAGE=mariadb
fi

echo "using ${DB_IMAGE} as db image."

docker-compose $@


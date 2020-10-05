#!/usr/bin/env bash
if uname -m | grep 'armv7'
then
  export DB_IMAGE=tobi312/rpi-mariadb
else
  export DB_IMAGE=mariadb
fi

if [ -f /etc/timezone ]; then
  export TZ=`cat /etc/timezone`
elif [ -h /etc/localtime ]; then
  export TZ=`readlink /etc/localtime | sed "s/^.*\/zoneinfo\///"`
else
  checksum=`md5sum /etc/localtime | cut -d' ' -f1`
  export TZ=`find /usr/share/zoneinfo/ -type f -exec md5sum {} \; | grep "^$checksum" | sed "s/.*\/zoneinfo\///" | head -n 1`
fi

echo "using ${DB_IMAGE} as db image."
echo "timezone: ${TZ}"

export DB_PORT=5506

docker-compose $@


#!/bin/bash
set -euo pipefail

# By default the script will remove the MySQL datadir to force re-initialization.
# Set FORCE_REINIT=false to skip deletion.
FORCE_REINIT=${FORCE_REINIT:-true}
DATADIR="/var/lib/mysql"

if [ "${FORCE_REINIT}" != "false" ]; then
  if [ -d "${DATADIR}" ]; then
    echo "[custom-entrypoint] FORCE_REINIT=${FORCE_REINIT} -> clearing MySQL datadir: ${DATADIR}"
    rm -rf "${DATADIR}"/* || true
  else
    echo "[custom-entrypoint] Datadir ${DATADIR} does not exist; skipping clear"
  fi
else
  echo "[custom-entrypoint] FORCE_REINIT=false -> skipping datadir clear"
fi

# Ensure ownership is correct for MySQL
chown -R mysql:mysql "${DATADIR}" || true

# Delegate to the original official entrypoint which will initialize the DB
# and execute any scripts in /docker-entrypoint-initdb.d
exec docker-entrypoint.sh "$@"

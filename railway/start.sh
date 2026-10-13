#!/bin/sh
set -eu

: "${PORT:=8080}"

# If DATABASE_URL is supplied, Django uses PostgreSQL instead.
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
    VOLUME_PATH="$RAILWAY_VOLUME_MOUNT_PATH"
    if [ ! -d "$VOLUME_PATH" ] || [ ! -w "$VOLUME_PATH" ]; then
      echo "[Bon-Bon] WARNING: Railway Volume mavjud emas yoki yozish uchun ruxsat yo'q: $VOLUME_PATH" >&2
      echo "[Bon-Bon] WARNING: Temporary SQLite fallback ishlatiladi." >&2
      VOLUME_PATH="${INSTA_KIDS_DATA_PATH:-/tmp/instakids-data}"
    else
      export RAILWAY_VOLUME_MOUNT_PATH="$VOLUME_PATH"
      mkdir -p "$VOLUME_PATH/media"
      if [ ! -f "$VOLUME_PATH/db.sqlite3" ] && [ -f /app/db.sqlite3 ]; then
        echo "[Bon-Bon] First run: copying initial SQLite database to $VOLUME_PATH"
        cp /app/db.sqlite3 "$VOLUME_PATH/db.sqlite3"
      fi
    fi
  else
    VOLUME_PATH="${INSTA_KIDS_DATA_PATH:-/tmp/instakids-data}"
    mkdir -p "$VOLUME_PATH/media"
    echo "[Bon-Bon] WARNING: DATABASE_URL and Railway Volume are not configured. Falling back to temporary SQLite."
    echo "[Bon-Bon] WARNING: Attach PostgreSQL or a mounted Volume for persistent data in production."
    export INSTA_KIDS_DATA_PATH="$VOLUME_PATH"
  fi
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[Bon-Bon] Database: PostgreSQL"
elif [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
  echo "[Bon-Bon] Database: SQLite on persistent Railway Volume (${RAILWAY_VOLUME_MOUNT_PATH})"
else
  echo "[Bon-Bon] Database: Temporary SQLite (${INSTA_KIDS_DATA_PATH})"
fi

MIGRATE_OK=0
if python manage.py migrate --noinput; then
  MIGRATE_OK=1
else
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "[Bon-Bon] WARNING: PostgreSQL migration failed or the database is not ready. Falling back to SQLite for this boot." >&2
    unset DATABASE_URL
    if [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ] && [ -d "$RAILWAY_VOLUME_MOUNT_PATH" ] && [ -w "$RAILWAY_VOLUME_MOUNT_PATH" ]; then
      export RAILWAY_VOLUME_MOUNT_PATH="$RAILWAY_VOLUME_MOUNT_PATH"
      mkdir -p "$RAILWAY_VOLUME_MOUNT_PATH/media"
      if [ ! -f "$RAILWAY_VOLUME_MOUNT_PATH/db.sqlite3" ] && [ -f /app/db.sqlite3 ]; then
        cp /app/db.sqlite3 "$RAILWAY_VOLUME_MOUNT_PATH/db.sqlite3"
      fi
    else
      VOLUME_PATH="${INSTA_KIDS_DATA_PATH:-/tmp/instakids-data}"
      mkdir -p "$VOLUME_PATH/media"
      export INSTA_KIDS_DATA_PATH="$VOLUME_PATH"
    fi
    if python manage.py migrate --noinput; then
      MIGRATE_OK=1
    fi
  fi
fi

if [ "$MIGRATE_OK" -ne 1 ]; then
  echo "[Bon-Bon] ERROR: Django migrations failed even after attempting fallback database setup." >&2
  exit 1
fi

# SQLite is kept to one worker to avoid multi-process write locks.
if [ -n "${DATABASE_URL:-}" ]; then
  WORKERS="${WEB_CONCURRENCY:-3}"
else
  WORKERS=1
fi

# Start Django first, then wait until it is ready before raising nginx.
gunicorn config.wsgi:application \
  --bind 127.0.0.1:8000 \
  --worker-class gthread \
  --workers "$WORKERS" \
  --threads "${GUNICORN_THREADS:-32}" \
  --timeout 120 \
  --graceful-timeout 30 \
  --keep-alive 75 \
  --max-requests 2000 \
  --max-requests-jitter 200 \
  --access-logfile - \
  --error-logfile - &
GUNICORN_PID=$!

cleanup() {
  kill "$GUNICORN_PID" 2>/dev/null || true
  wait "$GUNICORN_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

READY_TIMEOUT=60
READY_CHECKED=0
while [ "$READY_CHECKED" -lt "$READY_TIMEOUT" ]; do
  if python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/', timeout=2).read()" >/dev/null 2>&1; then
    break
  fi
  READY_CHECKED=$((READY_CHECKED + 1))
  sleep 1
done

if ! python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/', timeout=2).read()" >/dev/null 2>&1; then
  echo "[Bon-Bon] ERROR: Django did not become healthy within ${READY_TIMEOUT}s. Exiting." >&2
  exit 1
fi

# Let nginx be the public process and keep the container alive.
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
nginx -t
nginx -g 'daemon off;'

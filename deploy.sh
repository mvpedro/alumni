#!/bin/bash
set -e

# Alumni Automação UFSC — Deploy Script
# Requires: UFSC VPN connection, sftp available
# Usage: bash deploy.sh
#
# Steps:
#   1. Builds the project (npm run build)
#   2. Generates an SFTP batch file
#   3. Connects via SFTP (will prompt for password: dHbuE39N)

SFTP_HOST="nfs.sites.ufsc.br"
SFTP_PORT="2200"
SFTP_USER="alumniautomacao"
REMOTE_DIR="public_html"
LOCAL_DIR="dist"

echo "==> Step 1: Building..."
npm run build
echo ""

echo "==> Step 2: Preparing upload..."
BATCH_FILE=$(mktemp)

# Start in the remote directory
echo "cd $REMOTE_DIR" >> "$BATCH_FILE"

# Upload root files
for f in "$LOCAL_DIR"/.htaccess "$LOCAL_DIR"/index.html "$LOCAL_DIR"/alumni-logo.png; do
  [ -f "$f" ] && echo "put $f $(basename $f)" >> "$BATCH_FILE"
done

# Ensure assets dir exists, upload each asset individually
echo "-mkdir assets" >> "$BATCH_FILE"
for f in "$LOCAL_DIR"/assets/*; do
  [ -f "$f" ] && echo "put $f assets/$(basename $f)" >> "$BATCH_FILE"
done

echo "bye" >> "$BATCH_FILE"

echo "==> SFTP commands:"
cat "$BATCH_FILE"
echo ""

echo "==> Step 3: Connecting to $SFTP_HOST (password will be prompted)..."
echo ""
sftp -P "$SFTP_PORT" -b "$BATCH_FILE" "$SFTP_USER@$SFTP_HOST"

rm -f "$BATCH_FILE"
echo ""
echo "==> Deploy complete! Check https://alumniautomacao.ufsc.br"

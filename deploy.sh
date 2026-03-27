#!/bin/bash
set -e

echo "Downloading latest build artifact from GitHub Actions..."
gh run download --name dist -D ./dist

echo "Uploading to UFSC server via FTP..."
echo "Make sure you are connected to the UFSC VPN!"
lftp -c "open ftp://$FTP_USER:$FTP_PASS@alumni.automacao.ufsc.br; mirror -R --delete ./dist /"

echo "Deploy complete!"

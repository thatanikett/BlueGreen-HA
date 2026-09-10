#!/bin/bash
set -e

# Stop any running backend containers
docker stop backend || true
docker rm backend || true

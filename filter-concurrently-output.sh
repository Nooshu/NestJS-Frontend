#!/bin/sh

# Run the given command, filtering out noisy exit messages from concurrently and child processes
"$@" 2>&1 | grep -vE 'exited with code|SIGINT' 
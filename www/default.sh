#!/bin/bash

export LCS_USER=sosmUser
export LCS_DB=db_sosm
export LCS_PASS=dnRk384!djrLdo}836w:
export LCS_PORT=$((3000+UID))
echo "Starting LIF Tool with main DB ($LCS_USER - $LCS_DB - $LCS_PORT)"
nodejs app.js

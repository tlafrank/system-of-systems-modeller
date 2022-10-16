#!/bin/bash
set -e
# move to script directory for relative references to be correct
cd $(dirname $(readlink -f $0))

: ${SOSM_USER:=sosmUser}
: ${SOSM_DB:=db_sosm}
: ${SOSM_PASS:=dnRk384!djrLdo}836w:}

while getopts "p:d" options; do
  case ${options} in
    p)
      SOSM_PORT=${OPTARG}
      ;;
    d)
      # Enable debugging via chrome or similar
      NODEARGS='--inspect '
      ;;
    b)
      SOSM_DB=${OPTARG}
      ;;
    :)
      echo "Error: -${OPTARG} requires an argument."
      ;;
  esac
done

if [ -z "${SOSM_PORT}" ]
then
  read -p "Which port would you like to start the server on (Above 3000 recommended): " port
  SOSM_PORT=${port}
fi

export SOSM_USER
export SOSM_DB
export SOSM_PASS
export SOSM_PORT

echo "Starting SOSM with main DB ($SOSM_USER - $SOSM_DB - $SOSM_PORT)"
echo "http://localhost:${SOSM_PORT}"

NODEX=nothing

if `which nodemon > /dev/null 2>&1`; then
  echo using nodemon exe automatically reloads the nodeJS server on changes to web apps files
  NODEX="nodemon"
elif `which nodejs > /dev/null 2>&1`; then
  echo using nodejs exe
  NODEX="nodejs"
elif `which node > /dev/null 2>&1`; then
  echo using node exe
  NODEX="node"
else
  echo "No nodejs executable found."
  exit 1
fi

cd www
${NODEX} ${NODEARGS} app.js
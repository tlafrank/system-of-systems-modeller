#!/bin/bash
# Package up some online accessible assets to make them available
# on an isolated network.
set -e
# move to script directory for relative references to be correct
cd $(dirname $(readlink -f $0))

# Ensure off-line assets are available
../deploy/get_assets.sh

function update_modules(){
  # Ensure we have updated/installed npm packages
  pushd ../www
  npm update
  popd
}
update_modules

pex_dir=../package_export
rzip=${pex_dir}/resources.zip

function prepare_export_dir(){
  mkdir -p ${pex_dir}
  if [ -e ${rzip} ]; then
    rm ${rzip}
  fi
}
prepare_export_dir

# Zip the resources now
zip -r ${rzip} ../www/node_modules ../www/src ../www/images ../www/clientSide/privateConstants.js

git_mirror_dir=${pex_dir}/git_mirror
function make_mirror()
{
  if [ -d ${git_mirror_dir} ]; then
    rm -rf ${git_mirror_dir}
  fi
  mkdir -p ${git_mirror_dir}
  pushd ${git_mirror_dir}
  url=`git remote -vv | grep origin | grep fetch`
  url=`echo ${url} | awk '{ print $2 }'`
  git clone ${url}
  popd
}
make_mirror
gmzip=${pex_dir}/gitmirror.zip
zip -r ${gmzip} ${git_mirror_dir}

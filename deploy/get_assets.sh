#!/bin/bash
set -e

#Used to fetch the contents of the www/src folder.

function get_asset()
{

  asset_url=$1
  # figure out filename
  filename=`basename ${asset_url}`
  # get to directory
  echo -e "\n\n\n\n"
  echo getting $1 to ./src/${filename}
  wget $asset_url -O ./src/${filename}
  if [ $? -ne 0 ]; then
    echo '***** Error retrieving asset **** ' 
  fi
}

ASSET_URLS=(

https://code.jquery.com/jquery-3.5.1.min.js
#https://code.jquery.com/jquery-3.6.0.min.js

https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js
#https://cdn.jsdelivr.net/npm/bootstrap@2.3.1/dist/js/bootstrap.min.js

https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css
#https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css
#https://cdn.jsdelivr.net/npm/bootstrap@2.6.1/dist/css/bootstrap.min.css

https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js

https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js
#https://cdn.jsdelivr.net/npm/chart.js@1.7.1/dist/chart.min.js

https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.21.0/cytoscape.min.js
#https://cdnjs.cloudflare.com/ajax/libs/cytoscape/1.21.0/cytoscape.min.js

https://unpkg.com/layout-base/layout-base.js

https://unpkg.com/cose-base/cose-base.js

https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js
)

# Move to the www folder
# move to script directory for relative references to be correct
cd $(dirname $(readlink -f $0))
cd ../www


mkdir -p ./src

for url in ${ASSET_URLS[@]}; do
  get_asset $url
done

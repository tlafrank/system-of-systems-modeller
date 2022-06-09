#!/bin/bash
function get_asset()
{
  asset_url=$1
  # figure out filename
  filename=`basename ${asset_url}`
  # get to directory
  echo -e "\n\n\n\n"
  echo getting $1 to ./assets/${filename}
  wget $asset_url -O ./assets/${filename}
  if [ $? ]; then
    echo '***** Error retrieving asset ****'
  fi
}

ASSET_URLS=(
https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js
#https://cdn.jsdelivr.net/npm/bootstrap@2.3.1/dist/js/bootstrap.min.js

https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css
#https://cdn.jsdelivr.net/npm/bootstrap@2.6.1/dist/css/bootstrap.min.css
#https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css

https://code.jquery.com/jquery-3.6.0.min.js
https://code.jquery.com/jquery-3.5.1.min.js

https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js

https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.21.0/cytoscape.min.js
#https://cdnjs.cloudflare.com/ajax/libs/cytoscape/1.21.0/cytoscape.min.js

https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js
#https://cdn.jsdelivr.net/npm/chart.js@1.7.1/dist/chart.min.js
)

for url in ${ASSET_URLS[@]}; do
  get_asset $url
done

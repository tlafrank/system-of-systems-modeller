const path = require('path');
const fs = require('fs');

let debugOn = false;
//debugOn = true;

//Platform controller
function debug(msg){
	if (debugOn){
		console.log(msg);
	}
}


exports.getImages = (req,res) => {
    debug('Entering images.getImages');

    const directoryPath = path.join(__dirname, '../images/');
    debug('Image folder path is: ' + directoryPath);

    fs.readdir(directoryPath, (err,files) => {
        if (err) { 
            return;
        }
        debug('Files in directory:');
        debug(files);

        //Respond to client
        res.json(files);
    });

}
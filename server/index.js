const logger = require('./utils/logger.js');
const app = require('./app');
const port = process.env.PORT || 3000;


app.listen(port, ()=> {
    logger.info( { port }, 'SOSM listening');
    //console.log(`Server started on port ${port}`);
})

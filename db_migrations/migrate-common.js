module.exports = {
    DEBUG:  0,
    VERBOSE: 1,
    LOG: 2,
    WARNING: 3,
    ERROR: 4,
    _logLevel : 2, // default to LOG, but can't refer back to value
    setLogLevel : function(level)
    {
        this._logLevel = level;
    },
    /*
        Timestamped log function to help debugging
        async calls into the database or timing.
        args:
        msg - simple string message to append.
        level - [optional, default: LOG] the message level for filtering
    */
    log: function (msg, level) {
        var d = new Date();
        var prefix = "LOG";
        if ( typeof level == 'undefined' )
        {
            level = this.LOG;
        }
        switch(level){
            case this.DEBUG:
                prefix = "DEBUG";
                break;
            case this.VERBOSE:
            case this.LOG:
                prefix = "LOG";
                break;
            case this.WARNING:
                prefix = "WARNING";
                break;
            case this.ERROR:
                prefix = "ERROR!";
                break;
            default:
                prefix = "<?>";
                break;
        }
        if ( level >= this._logLevel ){
            console.log(`<${prefix}> ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}\t${msg}`);
        }
    }
}
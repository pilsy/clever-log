var pad = require('pad')
  , uberclass = require('uberclass');

module.exports = uberclass.extend(
{
	singleton: null,

	realConsole: null,

	logLevels: [
		{
            funcName: 'log',
            level: 'debug'
		},
        {
            funcName: 'log',
            level: 'info'
        },
        {
            funcName: 'log',
            level: 'notice'
        },
        {
            funcName: 'warn',
            level: 'warning'
        },
        {
            funcName: 'error',
            level: 'error'
        },
        {
            funcName: 'error',
            level: 'crit'
        },
        {
            funcName: 'error',
            level: 'alert'
        },    
        {
            funcName: 'error',
            level: 'emerg'
        }
	],

	setup: function() {
		this.realConsole = {};
		Object.keys( console ).forEach( this.callback('setConsoleFunc', console) );
	},

	setConsoleFunc: function( console, funcName ) {
		this.realConsole[ funcName ] = console[ funcName ];
	}
},
{
	realConsole: null,

	/**
	 * It currently changes the console globally, we should support only current scope?
	 * 
	 * @param  {Object} console The console object you wish you modify
	 * @return {string}         Any error that was encountered while trying to setup the console object
	 */
	setup: function( console ) {
        if ( this.Class.singleton !== null ) {
            return [ 'Already an instance running.' ];
        }

		Object.keys( this.Class.logLevels ).forEach( this.proxy('setupConsoleFunc', console) );
        return [ null, console ];
	},

	setupConsoleFunc: function( console, logLevel ) {
		console[ logLevel.level ] = this.proxy( 'log', logLevel.funcName, logLevel.level );
	},

	init: function( error, console ) {
        if ( error ) {
            this.Class.realConsole.error( error );
        } else {
            this.singleton = this;
            console.log = this.proxy( 'log', 'log', 'debug' );
        }
	},

    log: function() {
        var args = Array.prototype.slice.call( arguments )
          , funcName = args.shift()
          , logLevel = args.shift()
          , message = args.shift()
          , stack = this.getStack();

        // Implement log.level >= and <= etc (working out if we should put into loggly or console)
        
        // this.Class.realConsole.log( arguments );
        
        // Call the log function
        this.Class.realConsole[ funcName ].apply( console, args.concat( message, args ) );
    },

    getStack: function() {
        // This function needs to be fixed!
        var err = new Error( "test error" ),
            stack = ( err.stack || "" ).toString().split(/\r?\n/),
            match;

        for (var i=0, len = stack.length; i<len; i++){
            if ( (match = stack[i].match( /^\s*at\s[^\(]+\((.*:?[^\):]+):(\d+):\d+\)/ ) ) ) {

                if ( /uberclass/ig.test( match[ 1 ] ) || __filename.substr( -match[ 1 ].length ) == match[ 1 ] ){
                    continue;
                }

                return {
                    file: match[1],
                    line: Number( match[ 2 ] ) || 0
                };
            }
        }
        
        return null;
    }
});
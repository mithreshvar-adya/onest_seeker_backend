//@ts-nocheck

import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http';

// var convert = new Convert();
// var myLogFileStream = fs.createWriteStream('app.log');
const WebLogger = (server:HTTPServer) => {
    const io = new Server(server);
    io.on('connection', function (socket) {
        var fn = process.stdout.write;
        function write() {
            fn.apply(process.stdout, arguments);
            emmitter.apply(emmitter, arguments)
            // myLogFileStream.write.apply(myLogFileStream, arguments);
        }
        var errFn = process.stderr.write
        function error() {
            errFn.apply(process.stderr, arguments);
            emmitter.apply(emmitter, arguments)
            // myLogFileStream.write.apply(myLogFileStream, arguments);
        }
        process.stdout.write = write;
        process.stderr.write = error;
        function emmitter(data) {
            // data = convert.toHtml(data)
            let date = new Date().toJSON();
            data = '<b>' + date + '</b> : ' + data
            socket.emit('message',data);
        }
    });
}

const logsAuth = (req, res, next) => {
    // -----------------------------------------------------------------------
    // authentication middleware
  
    const auth = {login:"admin", password: "admin"} // change this
  
    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
  
    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
      // Access granted...
      return next()
    }
  
    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Authentication required.') // custom message
  
    // -----------------------------------------------------------------------
}


export  { WebLogger ,logsAuth};





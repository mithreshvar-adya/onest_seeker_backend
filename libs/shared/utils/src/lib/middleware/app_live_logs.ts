


async function live_logs(req:any, res:any, next:any) {
    try {
        const appDirectory = process.cwd();
        console.log(appDirectory)
        var index = `<!doctype html>
            <html>
            <head>
                <style type="text/css">
                    ul {
                        list-style-type: none;
                    }
                    html * {
                        color: rgb(0, 0, 0);
                        background-color: #f7f4f4 !important;
                        font-family: "Courier New" !important;
                    }
                    li::before {
                        content: "\\276F";
                    }
                </style>
                <script src='/socket.io/socket.io.js'></script>
                <script>
                    var socket = io();
                    var data = "";
                    socket.on('welcome', function (data) {
                        addMessage(data.message);
                    });
                    socket.on('message', function (data) {
                        addMessage(data);
                    });
                    function addMessage(message) {
                        var el = document.createElement('li'),
                            messages = document.getElementById('messages');
                        el.innerHTML = message
                        messages.appendChild(el);
                    }
                </script>
            </head>
            <body>
                <h2>Logs</h2>
                <ul id='messages'></ul>
            </body>
            </html>`
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(index);
      } catch (err) {
        console.log("Error ====>>>> ", err);
        res.status(200).send("Oops! Live logs not supporting...")
        // next(err); // Pass the error to the next middleware
    }
}

export { live_logs };

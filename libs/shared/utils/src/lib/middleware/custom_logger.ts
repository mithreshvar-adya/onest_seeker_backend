function customLogger(tokens:any, req:any, res:any) {
    const date = new Date().toISOString(); // Current timestamp
    const method = tokens.method(req, res); // HTTP method
    const url = tokens.url(req, res); // URL requested
    const httpVersion = "HTTP/" + req.httpVersion; // HTTP version
    const statusCode = res.statusCode; // HTTP status code

    // Construct custom log message
    return `date: ${date}, ${method} ${url} ${httpVersion} ${statusCode}`;
  }

export { customLogger}
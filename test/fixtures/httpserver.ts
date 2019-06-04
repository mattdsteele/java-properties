import http from "http";
import fs from "fs";
import { AddressInfo } from "net";

// a mini http server for testing

let props = fs.readFileSync('test/fixtures/unix.properties');
let server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(props.toString());
    res.end();
}).listen(0, "127.0.0.1");

server.on('listening', () => {
    // hack to prevent typescript for throwing 
    // error TS2722: Cannot invoke an object which is possibly 'undefined'.
    // see https://github.com/Microsoft/TypeScript/issues/21183
    (<any> process).send({
        "server_status": "Active",
        "host": (server.address() as AddressInfo).address,
        "port": (server.address() as AddressInfo).port
    });
});


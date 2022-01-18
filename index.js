const net = require("net");
const fs = require("fs");
const path = require("path");
const { PromiseSocket } = require("promise-socket");
const options = require("command-line-args")([
  { name: "file", alias: "f", type: String },
]);

(async () => {
  const scenarios = JSON.parse(fs.readFileSync(options.file));
  for (s of scenarios.scenarios) {
    console.log(s.title);
    console.log(s.description);
    const client = new PromiseSocket(new net.Socket());
    client.connect(scenarios.port, scenarios.host);
    await client.read(); // The server responds with the connected message.
    for (d of s.data) {
      console.log(d.title);
      const data = fs.readFileSync(`${path.dirname(options.file)}/${d.file}`);
      await client.write(data);
      if (d.response) {
        const res = await client.read();
        console.log(res.toString(), res.toString() === d.response);
      }
    }
    await client.end();
  }
})();

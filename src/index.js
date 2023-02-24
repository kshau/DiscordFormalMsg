require("dotenv").config()

const WebSocket = require("ws")
const {ChatGPTResponder} = require("./js/ChatGPTResponder")
const {fetch} = require("undici")

const {DISCORD_TOKEN, DISCORD_CLIENT_ID} = process.env;

async function edit(content, msgId, channelId) {
  await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${msgId}`, {
    "headers": {
      "authorization": DISCORD_TOKEN,
      "content-type": "application/json"
    },
    "body": JSON.stringify({content: content}),
    "method": "PATCH"
  });
}

function wsConnect() {

  var ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  var interval;

  ws.on("open", () => {

    ws.send(JSON.stringify({
      "op": 2,
      "d": {
        "token": DISCORD_TOKEN,
        "properties": {
          "os": "linux",
          "browser": "chrome"
        }
      }
    }))

  })


  ws.on("message", (data) => {

      var json = JSON.parse(data);

      var {op, t, d} = json;

      if (t == "MESSAGE_CREATE" && d.author.id == DISCORD_CLIENT_ID) {
        ChatGPTResponder.getResponse(`Say the part below exactly.\n${d.content}`).then(res => {
          edit(res, d.id, d.channel_id).then();
        })
      }

      if (op == 10) {
        interval = d.heartbeat_interval;
        setInterval(ms => {
          ws.send(JSON.stringify({
            op: 1,
            d: null
          }))
        }, interval)
      }
      
  })

  ws.on("close", wsConnect);

}

wsConnect();
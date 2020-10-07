# Entre-LOL

It's a module to interact with LCU WebSocketServer

## Installation
```
npm i entre-lol
```

## Usage
```javascript
const LCU = require("entre-lol")

let ws;
(async () => {
     ws = await LCU.createWebSocket()
});

LCU.READY.then(() => {
     ws.subscribe("OnJsonApiEvent")

     ws.on("OnJsonApiEvent", (type, uri, data) => {
          if (type === LCU.EVENT_TYPE.CREATE) console.log("Event type was 'Create'")
          else if (type === LCU.EVENT_TYPE.UPDATE) console.log("Event type was 'Update'")
          else if (type === LCU.EVENT_TYPE.DELETE) console.log("Event type was 'Delete'")

          console.log(`An event emitted in ${uri}, ${JSON.stringify(data)}`)
     })
})
```


### Elements

#### `function` createWebSocket(): Promise<LeagueWebSocket\>


#### `class` LeagueWebSocket({ auth: string, ip?: string, port: number })
- Properties
     - private controller: `WebSocket`
     - public authHeader: `string`
     - public ip: `string`
     - public port: `number`
     - public readonly subscriptions: `Set<WSEvents>`

- Methods
     - subscribe(event): boolean
          - Parameters:
            - event: `WSEvents` 

     - unsubscribe(event): boolean
          - Parameters:
            - event: `WSEvents` 
     
     - getEvents(): Promise<string[ ]\> # Returns the full list of events
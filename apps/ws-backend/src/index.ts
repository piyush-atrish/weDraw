import { WebSocketServer } from "ws";
import { verifyToken } from "@repo/backend-packages/jwt.utils";

const wss = new WebSocketServer({port:8080});

wss.on('connection' , function connection(ws , request){
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token =  queryParams.get('token') || "";
    const decoded = verifyToken(token , process.env.JWT_USER!);
    if(!decoded || !decoded.userId){
        ws.close();
        return;
    }
    ws.on('message',function message(data){
        ws.send('pong');
    });
});

console.log("web socket server running at port 8080...");
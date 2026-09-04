import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.css':'text/css','.png':'image/png','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.join(root,p);if(!file.startsWith(root+'/'))throw Error();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(4311,'127.0.0.1');

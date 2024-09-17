from aiohttp import web
import asyncio
import socketio
import time

sio = socketio.AsyncServer()
@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def chat_message(sid, data):
    print("message ", data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

async def hellos(what):
    for x in range(10):
        print(f"prepare {what} at {time.strftime('%X')}")
        await asyncio.sleep(1)
        print(f"{what} at {time.strftime('%X')}")    

async def bg_task(app):
    app[hello_co] = asyncio.create_task(hellos("hello"))
    yield
    app[hello_co].cancel()
    await app[hello_co]

app = web.Application()
hello_co = web.AppKey("hello_co", asyncio.Task[None])
app.cleanup_ctx.append(bg_task)
sio.attach(app)

if __name__ == '__main__':
    web.run_app(app, port=5000)
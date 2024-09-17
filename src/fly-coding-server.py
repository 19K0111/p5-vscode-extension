from aiohttp import web
import asyncio
import socketio
import time

sio = socketio.AsyncServer()
@sio.event
def connect(sid, environ):
    print("connect ", sid)


@sio.event
async def editor_to_server(sid, data):
    print("message ", data)
    await sio.emit("server_to_app", data)
@sio.event
async def chat_message(sid, data):
    print("message ", data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.event
async def my_response(sid, data):
    print('message received with ', data)

async def hellos(what):
    for x in range(100):
        #print(f"prepare {what} at {time.strftime('%X')}")
        await asyncio.sleep(1)
        await sio.emit("my_message", f'to_client {what}')

        #print(f"{what} at {time.strftime('%X')}")    

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
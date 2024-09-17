
import asyncio
import socketio
import time
import traceback

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print('connection established')

@sio.event
async def my_message(data):
    print('message received with ', data)
    await sio.emit('my_response', {'response': 'my response'})

@sio.event
async def server_to_app(data):
    try:
        exec(data, globals(), globals())
    except Exception:
        traceback.print_exc()

@sio.event
async def disconnect():
    print('disconnected from server')

async def hellos(what):
    for x in range(10):
        print(f"prepare {what} at {time.strftime('%X')}")
        await sio.sleep(1)
        print(f"{what} at {time.strftime('%X')}")    

async def main():
    await sio.connect('http://localhost:5000')
    # task = sio.start_background_task(hellos, "hello")
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())

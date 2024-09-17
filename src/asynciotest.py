import asyncio
import time

async def say_after(delay, what, times):
    for x in range(times):
        print(f"prepare {what} at {time.strftime('%X')}")
        await asyncio.sleep(delay)
        print(f"{what} at {time.strftime('%X')}")

async def main():
    task1 = asyncio.create_task(say_after(1, 'hello', 10))
    task2 = asyncio.create_task(say_after(1, 'world', 3))

    print(f"started at {time.strftime('%X')}")

    # await task1
    print(f"returned from await task1 at {time.strftime('%X')}")

    # await task2

    print(f"returned from await task2 at {time.strftime('%X')}")

  
    print(f"finished at {time.strftime('%X')}")

asyncio.run(main())

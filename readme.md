# p5-live-preview
A p5.js coding environment extended as a Visual Studio Code extension.


## How to run
<!-- - `$ npm install`
- `$ npm run compile`
- `F5` to start debugging
- Run the `> helloworld.emitCode` to check code emitting -->
- Open the command pallet and type `> p5.run`


## Commands
The extension provides the following commands:
<!-- - `> helloworld.helloWorld`: displays an alert.
- `> helloworld.emitCode`: sends codes to the server. -->
- `> p5.run`: runs the code which the editor focuses on.
- `> p5.reset`: resets variables which the extension preserves.
- `> p5.counter.show`: shows the number of times snapshots have been taken and the event macro has been executed.
- `> p5.counter.reset`: resets the counter of snapshots and the event macro.


## Example Programs
See the [`demo-example`directory](demo-example).

Copy an example file and paste it to a new file. All snapshotting examples are saved as variables (not images).
|                                                    Example FIle                                                     |          Snapshotting of Program States          |          Event Macro          |
| :-----------------------------------------------------------------------------------------------------------------: | :----------------------------------------------: | :---------------------------: |
|               Reversi<br>[`reversiEventMacroSnapshot.js`](demo-example/reversiEventMacroSnapshot.js)                |           ◯                <br>(Board)           | ◯        <br>(mouse handling) |
| Physics Simulation<br>[`physicsSimulationVectorVarsSending.js`](demo-example/physicsSimulationVectorVarsSending.js) |           ◯                <br>(Ball)            |  ◯        <br>(time related)  |
|                         Slide Puzzle<br>[`n-SlidePuzzle.js`](demo-example/n-SlidePuzzle.js)                         | ◯                <br>(State of tiles and a hole) |   ◯        <br>(key typing)   |


## Experiment
See the document (in Japanese) of this experiment for more detail. 
1. Complete the 4x4 slide puzzle in which the initial placement of cells is fixed. Snapshotting can be used if needed. You can ONLY modify the code between `// BEGIN` and `// END`.  
2. Complete the 3x3 slide puzzle in which the initial placement of the cells is random. Snapshotting can be used if needed. You can ONLY modify the code between `// BEGIN` and `// END`. 

## Settings
- `Re-executing Delay`: The delay time to re-execute the code after the last change (default value: `3000`). 

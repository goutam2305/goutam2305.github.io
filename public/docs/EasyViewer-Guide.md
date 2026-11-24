# EasyViewer - User guide

GOUTAM Lab | Unreal Engine 5.1 – 5.9 | Paid, on Fab

Set up an orbit viewer, hotspots and item inspection in your Unreal Engine project. Everything is Blueprint, so every graph can be opened and changed.

EasyViewer is a complete Unreal Engine project. In the Epic Games Launcher, find it in your Fab library and choose Create Project, then open the EV_Demo map and press Play. To use it in a project you already have, right-click the EasyViewer folder in the Content Browser and choose Migrate.

## Orbit viewer

One Blueprint in the level turns any object into a showcase with orbit, pan and zoom.

1. Drag BP_EasyViewerPawn into your level.
2. In its Details panel set Focus Actor to the object you want to show, or tag objects with EasyViewer.
3. Press Play. The viewer takes control of player 0, frames the object by its size and shows the default UI.
4. Add more objects to Focus Targets to get Prev / Next buttons and a smooth glide between them.

### Settings

| Setting | What it does |
| --- | --- |
| Orbit | Left drag, one finger or the left stick. |
| Pan | Right or middle drag, two fingers or the right stick. |
| Zoom | Mouse wheel, pinch or the triggers. |
| Reset | Double-click, R, double-tap, gamepad Y or the Reset View button. |
| Previous / next object | Q / E, the Prev / Next buttons or LB / RB. |

Open EV_Demo and press Play to try everything first. The button at the top switches to the item inspection demo.

## Hotspots

Mark details on your object. Players click a ring and the camera flies to that spot.

1. Drag BP_EVHotspot onto the surface of your object.
2. Set Follow Actor to the object so the hotspot moves and spins with it.
3. Fill Title and Description for the info panel, and set View Distance.
4. Optional: tick Use Hotspot Rotation and rotate the hotspot so its arrow points along the view you want.

### Settings

| Setting | What it does |
| --- | --- |
| Title / Description | Text shown on hover and in the info panel. |
| View Distance | How close the camera comes when the hotspot is selected. |
| Use Hotspot Rotation | Use the hotspot’s own arrow as the viewing angle. |
| Marker Color / Active Marker Color | Ring colour at rest and when selected. |

Rings are small and translucent at rest, grow with a glow and name label on hover, and turn to the accent colour when selected.

While a hotspot is selected, orbit, pan and zoom stay around it. Reset returns to the full view.

## Turntable mode

Spin the object itself while the camera stays where it is.

1. Make sure the object’s Mobility is set to Movable.
2. Press the Mode button in the default UI to switch between Orbit and Turntable.
3. Drag on the object to spin it. Drag anywhere else to orbit the camera.
4. Tick Rotate Actor Mode on the viewer to start in Turntable mode.

### Settings

| Setting | What it does |
| --- | --- |
| Rotate Actor Mode | Start in Turntable mode instead of Orbit. |
| Idle auto-rotate | Slowly turn the view when nobody is touching it. |
| Mode button | Switches mode at runtime; works with touch. |

Hotspots set to follow the object keep their place on it while it spins.

## Item inspection

Let players pick up an item from the world, turn it in their hands and put it back.

1. Add BP_EVInspectComponent to your Player Controller or player pawn.
2. From any Blueprint, call Inspect Item with the player controller and the item, for example when the player presses E or taps the item.
3. The item flies into view and the background blurs. Drag or use the left stick to turn it, wheel or pinch to zoom.
4. Esc, Backspace, gamepad B or the Close button puts the item back exactly where it was and returns control to the player.

### Settings

| Setting | What it does |
| --- | --- |
| Inspect Item | Pick up a small item and turn it in front of the camera. |
| Inspect Actor | Switch to the orbit viewer around a large object such as a car or statue. |
| End Inspect / Is Inspecting | Stop inspecting from your own logic, or check the state. |
| Get Inspect Viewer | Reach the active viewer to change its settings. |

The item must be Movable. Physics on the item is paused while it is inspected.

Hotspots on an item turn it towards the player when clicked.

EV_InspectDemo shows a complete setup with a look-to-select player and an on-screen prompt.

## Settings & events

Every option sits under Easy Viewer in the Details panel of BP_EasyViewerPawn.

1. Select the viewer in your level and open the Easy Viewer categories in Details.
2. Adjust input, camera, ground and key settings, or assign a BP_EVPreset data asset to apply a whole set at once.
3. Turn off Create Viewer Widget to use your own UI.
4. Bind the events in your Level Blueprint or your own Blueprints to react to the viewer.

### Settings

| Setting | What it does |
| --- | --- |
| Input | Enable mouse, touch or gamepad, dead zone and cursor handling. |
| Settings | Orbit speed, pitch and yaw limits, framing and distances, pan, smoothing, inertia, idle rotation. |
| Ground | Keep the camera above the bottom of the object or a fixed height. |
| Keys | Every key can be rebound. |
| Events | On Focus Changed, On Hotspot Changed, On Input Device Changed, On View Reset, On Inspect Started / Ended. |

Useful functions: Reset View, Set Focus Actor, Next / Previous Target, Fly To Hotspot, Set View, Take Screenshot, Apply Preset, Set Viewer Input Enabled.

On mobile, set Project Settings > Input > Default Touch Interface to None so the default joysticks do not cover the viewer.

The demo maps use Lumen and virtual shadow maps. EasyViewer itself works with any lighting.

Upgrading from 2.x: 3.0 uses new asset names and installs alongside the old files. Swap in BP_EasyViewerPawn when ready, then delete the 2.x folders.

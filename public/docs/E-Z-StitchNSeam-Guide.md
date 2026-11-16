# E-Z StitchNSeam - User guide

GOUTAM Lab | 3ds Max 2026 | Free beta preview

A practical guide to creating, editing and delivering live stitch geometry in 3ds Max.

Download the free MZP from the tool page on the GOUTAM Lab website and accept the software terms. Drag the MZP into Max to open Install / Repair. Free personal and commercial use; modifying the software requires prior GOUTAM Lab consent.

## Create a stitch set

Your spline defines the path. A single procedural object keeps the stitches together.

1. Draw and select one or more splines in Max.
2. Launch E-Z StitchNSeam from the GOUTAM Lab action.
3. Choose a stitch pattern and adjust its dimensions in Modify.
4. Select the stitch object again to continue editing.

### Settings

| Setting | What it does |
| --- | --- |
| Source splines | Pick or add paths to the same set. |
| All / Selected | Apply shared settings or override the selected source rows. |
| Live | Follow edits to the source splines. |

Download the MZP from this tool’s page and accept the software terms. Drag it into Max to open the installer.

## Patterns & thread

Choose the stitch construction and the thread cross-section separately.

1. Choose Straight, Cross, Double, Zigzag, Herringbone, Blanket, Arched or Bridge.
2. Choose Round or Flat thread.
3. Set Length, Width, Depth and Gap.
4. Use the pattern-specific controls to refine its shape.

### Settings

| Setting | What it does |
| --- | --- |
| Length / Gap | Set stitch size and spacing along the path. |
| Width / Depth | Control thread thickness, including fine 0.01 mm steps. |
| Row span / Arch | Adjust the available cross-row or raised pattern controls. |
| Rounded Entry / End Bend | Shape the thread ends while respecting valid bend limits. |

An invalid dimension combination retains the last valid result and shows an explanation.

## Placement & source edits

Refine the fit without rebuilding the scene as thousands of separate objects.

1. Pick additional splines when several paths belong in one set.
2. Select source rows for local overrides.
3. Adjust offsets, rotation or trims.
4. Edit the splines with Live enabled and review the result.

### Settings

| Setting | What it does |
| --- | --- |
| Offsets / Rotation | Position the thread relative to its path. |
| Start / End trims | Leave deliberate gaps near the ends. |
| Model normals | Use a model to help orient inward thread ends. |
| Source overrides | Keep selected paths different while sharing the rest of the set. |

Start with moderate detail and increase it after the placement is settled.

## Materials & delivery

Keep the set live while working, then choose how to hand it off.

1. Use Fast output for a single selectable mesh per set.
2. Use Precise output when you need exact curved thread geometry.
3. Apply the optional thread material or use your own material.
4. Convert to Poly when the recipient needs ordinary geometry.

### Settings

| Setting | What it does |
| --- | --- |
| Fast / Precise | Choose the working mesh representation. |
| Mapping | Use the available UV channels and real-world mapping controls. |
| Thread material | Supported V-Ray classes are needed for automatic material creation. |
| Convert to Poly | Create one Editable Poly result deliberately. |

Geometry creation does not require V-Ray.

Editable procedural scenes require the tool. Use Asset Tracking or Archive to collect thread maps when sharing scenes.

Seam and hole generation are coming soon and are not available in the stitch beta.

## Coming soon

Seam generation: not available in this beta.

Hole generation: not available in this beta.

# E-Z Reference - User guide

GOUTAM Lab | 3ds Max 2026 | Free beta preview

Create correctly sized image planes and keep them useful throughout a modelling session.

Download the free MZP from the tool page on the GOUTAM Lab website and accept the software terms. Drag the MZP into Max to open Install / Repair. Free personal and commercial use; modifying the software requires prior GOUTAM Lab consent.

## Add an image

Preview one image at a time in a window that can stay open beside the viewport.

1. Save an ordinary local .max scene.
2. Launch E-Z Reference from the GOUTAM Lab action.
3. Drop one PNG, JPEG, TIFF or BMP, or choose Browse.
4. Check the pixel dimensions and aspect ratio before creating a plane.

### Settings

| Setting | What it does |
| --- | --- |
| Image | The input used for this reference plane. |
| Preview / Pixels | Inspect the image and its original proportions. |
| Scene destination | Images are copied to source_files beside the saved scene. |

No special project name or internal folder hierarchy is required.

Download the MZP from this tool’s page and accept the software terms. Drag it into Max to open the installer.

## View, size & opacity

Enter the measurement you know. The other dimension follows the image.

1. Choose Front, Back, Left, Right, Top or Bottom.
2. Choose Width or Height as the known measurement.
3. Enter that measurement in the displayed scene units.
4. Choose Opacity and create the reference, then position it with normal Max transforms.

### Settings

| Setting | What it does |
| --- | --- |
| View | The canonical orientation of the new plane. |
| Set by | Calibrate from width or height. |
| Dimension | The known physical measurement in scene units. |
| Opacity | The plane material opacity at creation. |

The image aspect ratio is preserved. The plane begins at the scene origin in the chosen view.

## Select, lock & restore

Manage this edition’s reference planes without hunting through unrelated scene objects.

1. Choose a plane from the reference list.
2. Select in Scene to work with its transforms.
3. Use Lock or Unlock to protect it from accidental selection.
4. Use Restore Aspect Ratio or Restore Orientation when you want its original calibrated state.

### Settings

| Setting | What it does |
| --- | --- |
| Select in Scene | Select the chosen unlocked reference. |
| Lock / Unlock | Control whether the plane is frozen. |
| Restore Aspect Ratio | Restore calibrated dimensions while preserving placement. |
| Restore Orientation | Return to the original canonical view. |

Use Max’s own hide/show and material controls when needed.

References from the earlier development edition remain separate.

## Keep images with the scene

Safe copying keeps references available without replacing an existing image by accident.

1. Keep the saved scene and its source_files folder together.
2. Reuse identical input images when appropriate.
3. If a different file already has the same name, rename the incoming image before trying again.
4. Use Asset Tracking or Archive when collecting a scene for delivery.

### Settings

| Setting | What it does |
| --- | --- |
| source_files | The image folder beside the saved scene. |
| Identical image | An existing matching image can be reused. |
| Name conflict | A different image is never overwritten silently. |

This beta supports local saved scenes. Linked/network workflows are not included.

Ordinary image planes remain in the scene after the tool is closed.

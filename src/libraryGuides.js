export const libraryGuides = {
  'ez-stitchnseam': {
    title: 'E-Z StitchNSeam',
    document: 'docs/E-Z-StitchNSeam-Guide.md',
    introduction: 'A practical guide to creating, editing and delivering live stitch geometry in 3ds Max.',
    comingSoon: ['Seam generation', 'Hole generation'],
    sections: [
      {
        id: 'overview', name: 'Create a stitch set',
        summary: 'Your spline defines the path. A single procedural object keeps the stitches together.',
        steps: ['Draw and select one or more splines in Max.', 'Launch E-Z StitchNSeam from the GOUTAM Lab action.', 'Choose a stitch pattern and adjust its dimensions in Modify.', 'Select the stitch object again to continue editing.'],
        settings: [['Source splines', 'Pick or add paths to the same set.'], ['All / Selected', 'Apply shared settings or override the selected source rows.'], ['Live', 'Follow edits to the source splines.']],
        notes: ['Download the MZP from this tool’s page and accept the software terms. Drag it into Max to open the installer.'],
      },
      {
        id: 'patterns', name: 'Patterns & thread',
        summary: 'Choose the stitch construction and the thread cross-section separately.',
        steps: ['Choose Straight, Cross, Double, Zigzag, Herringbone, Blanket, Arched or Bridge.', 'Choose Round or Flat thread.', 'Set Length, Width, Depth and Gap.', 'Use the pattern-specific controls to refine its shape.'],
        settings: [['Length / Gap', 'Set stitch size and spacing along the path.'], ['Width / Depth', 'Control thread thickness, including fine 0.01 mm steps.'], ['Row span / Arch', 'Adjust the available cross-row or raised pattern controls.'], ['Rounded Entry / End Bend', 'Shape the thread ends while respecting valid bend limits.']],
        notes: ['An invalid dimension combination retains the last valid result and shows an explanation.'],
      },
      {
        id: 'placement', name: 'Placement & source edits',
        summary: 'Refine the fit without rebuilding the scene as thousands of separate objects.',
        steps: ['Pick additional splines when several paths belong in one set.', 'Select source rows for local overrides.', 'Adjust offsets, rotation or trims.', 'Edit the splines with Live enabled and review the result.'],
        settings: [['Offsets / Rotation', 'Position the thread relative to its path.'], ['Start / End trims', 'Leave deliberate gaps near the ends.'], ['Model normals', 'Use a model to help orient inward thread ends.'], ['Source overrides', 'Keep selected paths different while sharing the rest of the set.']],
        notes: ['Start with moderate detail and increase it after the placement is settled.'],
      },
      {
        id: 'output', name: 'Materials & delivery',
        summary: 'Keep the set live while working, then choose how to hand it off.',
        steps: ['Use Fast output for a single selectable mesh per set.', 'Use Precise output when you need exact curved thread geometry.', 'Apply the optional thread material or use your own material.', 'Convert to Poly when the recipient needs ordinary geometry.'],
        settings: [['Fast / Precise', 'Choose the working mesh representation.'], ['Mapping', 'Use the available UV channels and real-world mapping controls.'], ['Thread material', 'Supported V-Ray classes are needed for automatic material creation.'], ['Convert to Poly', 'Create one Editable Poly result deliberately.']],
        notes: ['Geometry creation does not require V-Ray.', 'Editable procedural scenes require the tool. Use Asset Tracking or Archive to collect thread maps when sharing scenes.', 'Seam and hole generation are coming soon and are not available in the stitch beta.'],
      },
    ],
  },
  'ez-reference': {
    title: 'E-Z Reference',
    document: 'docs/E-Z-Reference-Guide.md',
    introduction: 'Create correctly sized image planes and keep them useful throughout a modelling session.',
    comingSoon: [],
    sections: [
      {
        id: 'overview', name: 'Add an image',
        summary: 'Preview one image at a time in a window that can stay open beside the viewport.',
        steps: ['Save an ordinary local .max scene.', 'Launch E-Z Reference from the GOUTAM Lab action.', 'Drop one PNG, JPEG, TIFF or BMP, or choose Browse.', 'Check the pixel dimensions and aspect ratio before creating a plane.'],
        settings: [['Image', 'The input used for this reference plane.'], ['Preview / Pixels', 'Inspect the image and its original proportions.'], ['Scene destination', 'Images are copied to source_files beside the saved scene.']],
        notes: ['No special project name or internal folder hierarchy is required.', 'Download the MZP from this tool’s page and accept the software terms. Drag it into Max to open the installer.'],
      },
      {
        id: 'calibration', name: 'View, size & opacity',
        summary: 'Enter the measurement you know. The other dimension follows the image.',
        steps: ['Choose Front, Back, Left, Right, Top or Bottom.', 'Choose Width or Height as the known measurement.', 'Enter that measurement in the displayed scene units.', 'Choose Opacity and create the reference, then position it with normal Max transforms.'],
        settings: [['View', 'The canonical orientation of the new plane.'], ['Set by', 'Calibrate from width or height.'], ['Dimension', 'The known physical measurement in scene units.'], ['Opacity', 'The plane material opacity at creation.']],
        notes: ['The image aspect ratio is preserved. The plane begins at the scene origin in the chosen view.'],
      },
      {
        id: 'scene-controls', name: 'Select, lock & restore',
        summary: 'Manage this edition’s reference planes without hunting through unrelated scene objects.',
        steps: ['Choose a plane from the reference list.', 'Select in Scene to work with its transforms.', 'Use Lock or Unlock to protect it from accidental selection.', 'Use Restore Aspect Ratio or Restore Orientation when you want its original calibrated state.'],
        settings: [['Select in Scene', 'Select the chosen unlocked reference.'], ['Lock / Unlock', 'Control whether the plane is frozen.'], ['Restore Aspect Ratio', 'Restore calibrated dimensions while preserving placement.'], ['Restore Orientation', 'Return to the original canonical view.']],
        notes: ['Use Max’s own hide/show and material controls when needed.', 'References from the earlier development edition remain separate.'],
      },
      {
        id: 'image-storage', name: 'Keep images with the scene',
        summary: 'Safe copying keeps references available without replacing an existing image by accident.',
        steps: ['Keep the saved scene and its source_files folder together.', 'Reuse identical input images when appropriate.', 'If a different file already has the same name, rename the incoming image before trying again.', 'Use Asset Tracking or Archive when collecting a scene for delivery.'],
        settings: [['source_files', 'The image folder beside the saved scene.'], ['Identical image', 'An existing matching image can be reused.'], ['Name conflict', 'A different image is never overwritten silently.']],
        notes: ['This beta supports local saved scenes. Linked/network workflows are not included.', 'Ordinary image planes remain in the scene after the tool is closed.'],
      },
    ],
  },
};

export const guideVersion = '0.15.0';
export const guideDate = '11 November 2026';

export const gettingStarted = [
  ['Open the toolbar', 'Launch the installed command from your 3ds Max toolbar or menu. Current beta builds may still label the command and floating rail Retopology. Hover an icon for its name; right-click a tool or click Settings for its options.'],
  ['Pick a source mesh', 'Click Source, then click the mesh in the viewport. Only a mesh can be picked. A separate Editable Poly cage is created; the source is protected while you work. If a saved cage is picked, the existing cage is resumed. Picking a dense source needs one preparation pass.'],
  ['Make your first quad', 'Choose Draw. Click four corners on the source. The fourth click creates a quad automatically. Add two more corners to continue. To work on another side, click that border edge first and place its two new corners.'],
  ['Finish or resume', 'Finish ends editing and keeps the source assignment and completed geometry. The Source menu offers Resume editing, Resume selected cage, New cage, Frame mesh and Clear source. Clear source releases the assignment; it does not delete your scene meshes.'],
];

export const feedback = [
  ['Cyan geometry', 'Completed cage geometry that you can select, move and extend.'],
  ['Gold edges', 'Persistent target-edge selection. It carries into the next compatible tool, with its unique edge count shown on the model.'],
  ['Orange curves and dots', 'Editable construction guides. Selecting a guide returns to guide-driven editing.'],
  ['Green quads', 'A patch preview. Inspect it, then press Enter to confirm or Esc to discard.'],
  ['Purple rings', 'Pinned or protected cage vertices. Brush operations respect this protection.'],
];

export const toolGuide = [
  {
    id: 'draw', name: 'Draw', summary: 'Place quads, move components and extend existing borders.',
    result: 'Four clicks create the first quad. Further faces reuse the active border.',
    steps: [
      'Choose Draw and click four corners on the source surface. You do not need Ctrl for normal quad placement.',
      'Continue with two new corner clicks per quad. Click close to an eligible existing cage vertex to reuse it when Auto-weld is enabled.',
      'To continue on a different side, click the border edge on that side, then place its two new corners. You do not have to keep following the last face.',
      'Drag a cage vertex, edge or face to move it on the source. Tab + left-drag extends one border edge; Tab + middle-drag extends a regular boundary run or ring.',
      'Shift-drag temporarily relaxes. Ctrl-hover and click inserts a loop; Ctrl + middle-click places it at the center.',
    ],
    settings: [
      ['Auto-weld / Snap radius', 'Surface / Display controls whether nearby eligible cage vertices are reused. Snap radius is measured in viewport pixels (3–80).'],
      ['Cage visibility', 'Face opacity, mesh color, point size and edge width are shared display options.'],
    ],
    notes: [
      'Delete or Backspace deletes the hovered component; X + left-drag erases exact components. Ctrl + Shift + left-drag starting inside a face marks crossed faces, then deletes them together on release.',
      'Esc during an edit cancels that edit. Esc while idle finishes the editing session. Use the on-model highlight to check which component a gesture will affect.',
    ],
  },
  {
    id: 'select', name: 'Select', summary: 'Choose the edges that the next tool should use.',
    result: 'Gold selected edges persist when you switch tools.',
    steps: [
      'Choose Select and click the middle of a target edge. This replaces the old selection.',
      'Shift-click another edge to add it; Shift-click a selected edge to remove it.',
      'Double-click a boundary edge to select its continuous run. Sharp corners stop the run. Shift-double-click toggles another run.',
      'Drag over edges to paint a selection. Start clearly in empty space to box-select visible edges instead.',
      'Choose Patches, Strokes or Contours to continue from a compatible selection. Ctrl+A selects all target edges; Ctrl+D clears them.',
    ],
    settings: [
      ['Select all / Clear selection', 'Available in the current-tool popup as well as Ctrl+A and Ctrl+D.'],
      ['Corner angle', 'Surface / Display sets when a boundary run is split at a sharp corner.'],
      ['On-model edge counts', 'Shows unique selected-edge counts at the geometry. Disable it in Surface / Display if needed.'],
    ],
    notes: ['This version selects target edges. General vertex/face/lasso/path selection is not part of this selection tool. Selecting an orange construction guide clears component selection and returns to guide-driven work.'],
  },
  {
    id: 'strips', name: 'Strips', summary: 'Draw a centerline and create an editable strip of quads.',
    result: 'Stroke release creates geometry automatically; orange handles can reshape it.',
    steps: [
      'Choose Strips. With Input set to Stroke, hold Ctrl and left-drag a short curve over a broad visible surface. Release to create the strip.',
      'For discrete points, choose Input: Points, click at least two centerline points and press Enter once to finish and create the strip.',
      'Drag an orange control point to reshape the attached strip. Click a handle to select its guide.',
      'With Join free ends on, Ctrl-hover near either open end. The full end highlights green and shows its count. Ctrl-left-drag outward from that end, then release.',
      'A joined continuation reuses the seam vertices and matches its width and Across rows. Draw toward a free end to join into it, or bridge two compatible free ends.',
    ],
    settings: [
      ['Input: Stroke / Points', 'Stroke is the default. Plain clicks in Stroke input select or edit; they do not begin a point curve.'],
      ['Along', 'Number of length divisions (1–128). Ctrl+wheel adjusts it.'],
      ['Across', 'Number of quad rows across the strip (1–128). Existing joined seams constrain this count.'],
      ['Width', 'Total strip width in scene units. Shift+wheel adjusts it; start narrow on tight curvature.'],
      ['Sharp corners', 'Makes point-input curve corners sharp. Drawn strokes use the shared Corner angle threshold.'],
      ['Join free ends', 'Allows continuation from either end. Turning it off affects new strokes; existing joins remain.'],
    ],
    notes: [
      'To continue from the other side, start at that side’s highlighted free end. Drawing backward across the parent strip is rejected.',
      'One accidental point is recoverable: Esc clears it, switching tools cancels it, or a fresh Ctrl-drag starts a new stroke. Editing Width does not finish a pending curve.',
      'Projection can fail at silhouettes, gaps and overlapping parts. Shorten the curve, reduce Width or restrict the source with Pick part. Previous geometry is preserved after a rejected edit.',
    ],
  },
  {
    id: 'strokes', name: 'Strokes', summary: 'Fill between two drawn rails, or continue a selected boundary.',
    result: 'A second compatible rail creates quads between the two rails.',
    steps: [
      'Choose Strokes and Ctrl-left-drag the first rail. Release: an orange guide is saved, with no faces yet.',
      'Draw a second rail on the same connected surface. Release to create the quad span automatically.',
      'Draw another rail to continue from the latest outer rail. To work on the other side, click the earlier outer rail’s orange control before drawing beyond that side.',
      'Alternatively, use Select to choose one compatible open target boundary, choose Strokes and draw a parallel rail. The span reuses the selected cage border.',
      'Drag live guide handles to reshape guide-driven bands. A selection-created span is direct cage geometry: refine it with Draw, Loops or Tweak.',
    ],
    settings: [
      ['Input', 'Ctrl-draw rails with Stroke, or finish point-input rails with Enter.'],
      ['Along', 'Divisions along guide-driven rails. Ctrl+wheel adjusts length density. A selected existing border keeps its original count.'],
      ['Across', 'Rows between the rails. Shift+wheel adjusts guide-driven band rows.'],
      ['Sharp corners', 'Preserve intentional corners in point-input rails.'],
    ],
    notes: ['This version supports paired rails and compatible selected boundaries, not arbitrary intersecting stroke networks. A newly created outer boundary stays selected for the next operation.'],
  },
  {
    id: 'patches', name: 'Patches', summary: 'Define four sides or use a selected boundary to preview a quad fill.',
    result: 'A green patch preview is confirmed with Enter.',
    steps: [
      'For a new patch, clear component selection, choose Patches, open its settings and choose Draw outline with Input: Points.',
      'Click four corners around a region on the source. The fourth closes the outline and shows a green grid. Set Along and Across, then press Enter to confirm.',
      'For curved boundaries, choose Draw four sides. Click points for one side and press Enter to finish that side; repeat for all four sides. With Stroke input, Ctrl-draw each side instead.',
      'Start and finish sides near existing endpoints so they form one four-sided cycle. After four compatible sides, inspect the green preview and press Enter.',
      'For an existing hole, select its target boundary edges, then choose Patches. Selected edges mode previews a compatible fill automatically. Ctrl-click a boundary vertex to change a marked corner.',
    ],
    settings: [
      ['Mode', 'Selected edges, Draw outline or Draw four sides. A component selection activates the boundary-driven workflow.'],
      ['Input', 'Points or Stroke for drawn guides. Selected-edge patches do not need a drawing input.'],
      ['Along / Across', 'Grid divisions for a drawn patch. Opposite existing sides must already have matching counts.'],
      ['Reset corners', 'Restore angle-based corner detection in the selected-boundary workflow. A four-sided fill needs four valid corners.'],
      ['Enter / Esc', 'Confirm a valid preview / cancel it. Only patches need this preview confirmation; strips and paired rails build automatically.'],
    ],
    notes: [
      'A selected four-sided hole needs matching edge counts on opposite sides. Settings never silently change or duplicate the old boundary edges.',
      'Arbitrary irregular holes, branches, poles and intersecting curve networks are not automatic fills. Simplify the region or correct its topology first.',
      'Changing the source or projection filter invalidates a preview. Refresh and inspect it before confirmation. A failed preview leaves completed geometry unchanged.',
    ],
  },
  {
    id: 'connect', name: 'Connect boundaries', toolbar: 'Patches', summary: 'Bridge two matching open borders or loft two matching closed loops.',
    result: 'New quads reuse the selected seam vertices exactly.',
    steps: [
      'Choose Select and select the facing open boundary on each of the two pieces. Use Shift to add the second border.',
      'Both open runs need the same number of edges. Choose Patches to preview the bridge.',
      'Set Quad rows to control the span density. Two rows means one intermediate edge loop.',
      'Inspect the green preview, then press Enter. The new faces share the original border vertices; this is one Undo step.',
      'For two compatible closed loops, Patches creates a loft instead. Adjust Twist to align the loops before confirming.',
    ],
    settings: [
      ['Quad rows', 'Rows between the selected borders. Ctrl+wheel adjusts it.'],
      ['Twist', 'Cyclic correspondence for a closed-loop loft. Shift+wheel adjusts it.'],
      ['Steps / Step width', 'A single selected boundary can extend outward instead: Steps is row count and Step width is a scene-unit distance.'],
    ],
    notes: ['This is the Patches boundary workflow, not an extra toolbar tool. Unequal counts, intersecting spans and folded results are rejected. Existing pins or protected seams can prevent a join.'],
  },
  {
    id: 'contours', name: 'Contours', summary: 'Create closed bands around legs, rails and other tube-like shapes.',
    result: 'A second closed section creates a quad band automatically.',
    steps: [
      'Choose Contours, Mode: Sections, Plane: Stroke. Frame a single leg or tube clearly.',
      'Hold Ctrl and left-drag from the empty gap on one side, across the visible source, into the opposite gap. Release to create a closed section guide.',
      'Cut another section at a different height. The second section creates quads between the contours; further cuts continue the band.',
      'Watch for the green source-hit marker during a cut. A missed or open section does not change completed geometry.',
      'Choose Edit guides to edit existing contours without cutting again. Two selected compatible closed guides can edit an earlier band; compatible selected cage loops can continue too.',
    ],
    settings: [
      ['Mode: Sections / Edit guides', 'Create new sections or work on existing guides.'],
      ['Plane: X / Y / Z / View / Stroke', 'Fixed world axes, camera plane, or a plane derived from the stroke direction and view.'],
      ['Along', 'Divisions around the band. Ctrl+wheel adjusts density.'],
      ['Across', 'Rows between contours.'],
      ['Twist', 'Alignment around the closed band. Shift+wheel adjusts correspondence.'],
    ],
    notes: ['The cut must cross the selected source or filter and produce a closed section. Restrict overlapping furniture parts with Pick part or Pick material. Explicit contour extraction can take seconds on a dense source; it is not performed continuously while orbiting.'],
  },
  {
    id: 'loops', name: 'Loops', summary: 'Insert and adjust edge loops on a compatible quad cage.',
    result: 'Hover feedback identifies the affected loop before insertion or sliding.',
    steps: [
      'Choose Loops and hover over a cyan cage edge. Inspect the loop preview, then click to insert.',
      'Ctrl + middle-click centers the new loop.',
      'Ctrl + Shift + middle-drag slides a supported regular interior loop.',
      'Ctrl + Shift-click on a regular interior edge dissolves its loop. Middle-drag is the slide gesture; left-button deletion is a different action.',
    ],
    settings: [
      ['Shared display controls', 'Use edge width, point size and on-model counts to make the preview clear.'],
      ['Topology requirements', 'Sliding and dissolving require a compatible regular loop. Poles, branches and unsupported boundaries can stop the operation.'],
    ],
    notes: ['Native middle-drag pan and Alt + middle-drag orbit remain navigation. Keep the complete modifier/button chord for a loop edit; inspect the highlight first.'],
  },
  {
    id: 'tweak', name: 'Tweak', summary: 'Move vertices with a visible brush, or use exact component dragging.',
    result: 'The brush circle shows the influence radius before the stroke.',
    steps: [
      'Choose Tweak and start with Brush: Grab. Hover over cyan topology; the circle shows the working radius.',
      'Left-drag to move the vertices under the starting circle with a soft influence. Grab uses stroke-start displacement, so returning to the same endpoint returns the same displacement.',
      'Use Nudge to carry vertices as the moving circle crosses the surface. Pinch pulls toward the brush center; Magnify pushes away.',
      'Use Component for exact vertex, edge or face dragging. Shift-drag temporarily relaxes.',
      'If the brush has no effect, check for purple protected rings, the Borders policy and the source filter. Esc cancels a stroke; a completed stroke is one Undo step.',
    ],
    settings: [
      ['Brush', 'Grab, Nudge, Pinch, Magnify or Component.'],
      ['Radius', 'Viewport pixels, 6–500. [ and ] resize the active brush.'],
      ['Strength', 'Influence from 0.02 to 1. Shift+[ and Shift+] adjust it.'],
      ['Falloff', 'Smooth softens the edge; Linear fades evenly; Constant is uniform; Sharp concentrates influence near the center.'],
      ['Borders', 'Pinned holds boundary vertices; Tangent slides straight sections while retaining corners; Free allows boundary movement.'],
    ],
    notes: ['Tweak and Relax remember separate radius, strength and falloff values. Pins, masks, source visibility and projection filters constrain both brushes. Projection failure restores the stroke.'],
  },
  {
    id: 'relax', name: 'Relax', summary: 'Smooth the cage, balance spacing or improve quad shape and flow.',
    result: 'Local brush passes respect the source surface and protected vertices.',
    steps: [
      'Choose Relax. Begin with Smooth, Strength 0.25 and one iteration; left-drag over the cage.',
      'Try Edge spacing to balance adjacent edge lengths, Face shape to improve quad parallelograms, or Edge flow to straighten opposing rails.',
      'Use Shift+P over a vertex to toggle a pin. Purple rings show protected vertices.',
      'Enable Paint protection mask to paint protected areas; Shift-drag erases that mask. Disable the option or press Esc to return to relaxation.',
      'Esc cancels an active stroke. A successful completed stroke has one Undo step. Release finishes queued local updates before committing.',
    ],
    settings: [
      ['Brush', 'Smooth, Edge spacing, Face shape or Edge flow. Flow can have little effect at poles without a reliable opposing pair.'],
      ['Radius / Strength / Falloff', 'Independent from Tweak. Use [ / ] for radius and Shift+[ / Shift+] for strength.'],
      ['Iterations', '1–12 local steps. Strength is distributed across the steps; higher settings require more work.'],
      ['Update', 'Parallel calculates a step from previous positions. Sequential also uses earlier accepted changes within that step.'],
      ['Borders', 'Pinned, Tangent or Free, with the same protection behavior as Tweak.'],
      ['Paint protection mask', 'Paint protected vertices instead of relaxing; Shift-drag erases the mask. Pins and masks survive cage save/resume.'],
    ],
    notes: ['Excessive relaxation can fold a face; invalid results are rejected. Use smaller local strokes and lower strength on tight detail. Shift-relax is off by default in advanced construction tools so it does not interfere with drawing.'],
  },
];

export const sharedSettings = [
  ['Auto-weld', 'Reuse nearby eligible cage vertices during supported creation and movement. Enabled by default.'],
  ['Snap radius', 'Screen-space snapping distance: 3–80 viewport pixels. Default 14.'],
  ['Face opacity', 'Translucent cage visibility: 0.05–1. Default 0.42.'],
  ['Mesh color', 'Choose the target cage color.'],
  ['Point size / Edge width', 'Point size 1–10; edge width 0.5–5. Use them to keep a dense cage readable.'],
  ['Stroke spacing', 'Pointer sampling spacing: 2–30 pixels. Default 6. Lower spacing records more points.'],
  ['Corner angle', 'Sharp-corner detection threshold: 10–170 degrees. Default 60. Also affects boundary run selection.'],
  ['On-model edge counts', 'Display selected-edge counts and guide/strip dimensions on the model.'],
  ['Tool color accents', 'Enable individual tool colors or return to neutral icons.'],
  ['Shift relax in advanced tools', 'Optional temporary relaxation in Strips, Strokes, Patches and Contours. Off by default and disabled while a point draft is pending.'],
  ['Symmetry: Off / X / Y / Z', 'Source-centered mirrored editing. Start with an empty or compatible cage; an arbitrary asymmetric cage may be rejected.'],
  ['Projection filter: All', 'Use the entire assigned source for projection.'],
  ['Projection filter: Pick part / Pick material', 'Choose the source region to project onto. Click the intended part or material area; Esc cancels picking. Useful for overlapping furniture parts.'],
  ['Shortcuts', 'Optional per-tool switching shortcuts. Native view/transform keys and Undo remain reserved; conflicting shortcuts are rejected. Preferences are per-user and require no administrator access.'],
];

export const shortcuts = [
  ['Middle-drag', 'Pan using 3ds Max navigation.'],
  ['Alt + middle-drag', 'Orbit using 3ds Max navigation.'],
  ['Mouse wheel', 'Zoom.'],
  ['F / P / T / L / B', 'Front / Perspective / Top / Left / Bottom view.'],
  ['Q / W / E / R', 'Leave editing and use the native selection/transform tool. Pick the cage to resume.'],
  ['Ctrl+Z / Ctrl+Y', 'Undo / Redo.'],
  ['Esc', 'Cancel a draft, preview or active stroke; while idle, finish editing.'],
  ['Enter', 'Finish point input or confirm a valid patch preview. In a numeric field, apply the field edit.'],
  ['Tab + left-drag', 'Extend one border edge in Draw.'],
  ['Tab + middle-drag', 'Extend a regular border run or ring in Draw.'],
  ['Ctrl + left-drag', 'Draw a construction stroke in Strips, Strokes, Patches or Contours.'],
  ['Ctrl+wheel', 'Adjust active guide density; selected boundary patches adjust rows/steps.'],
  ['Shift+wheel', 'Strips: width. Strokes: guide-driven rows. Contours/closed lofts: twist. Selected step: width.'],
  ['Ctrl-hover / Ctrl-click', 'Preview / insert a loop in Draw.'],
  ['Ctrl + middle-click', 'Insert a centered loop.'],
  ['Ctrl + Shift + middle-drag', 'Slide a supported regular interior loop.'],
  ['Ctrl + Shift + left-drag', 'Sweep-delete crossed faces when starting inside a face in Draw.'],
  ['Ctrl + Shift-click', 'Dissolve a regular interior edge loop.'],
  ['Delete / Backspace', 'Delete the hovered component.'],
  ['X + left-drag', 'Erase exact hovered components.'],
  ['Shift-drag', 'Temporary relax in Draw, Loops and Tweak. Optional for advanced tools.'],
  ['Shift+P', 'Toggle a pin under the pointer.'],
  ['[ / ]', 'Decrease / increase active brush radius.'],
  ['Shift+[ / Shift+]', 'Decrease / increase active brush strength.'],
  ['Shift-click in Select', 'Toggle a target edge in the selection.'],
  ['Double-click in Select', 'Select a continuous boundary run; Shift-double-click toggles it.'],
  ['Ctrl+A / Ctrl+D', 'Select all target edges / clear edge selection.'],
];

export const troubleshooting = [
  ['I drew one point and nothing happens', 'In Points input, Strips needs at least two points and Enter. An outline patch needs four corners. Esc clears the draft; switching tools cancels it. In Stroke input, hold Ctrl and draw rather than clicking.'],
  ['The first stroke did not create any faces', 'Strokes needs two rails and Contours needs two closed sections. The first is a construction guide; the second creates the span.'],
  ['The patch preview is missing', 'Check that a drawn outline is four-sided, or that selected edges form a supported border. Opposite counts must match; branches, intersections and source misses are rejected. Open current-tool settings to read the reason.'],
  ['The strip is on the wrong side or cannot project', 'Use a visible broad surface, reduce Width, shorten the stroke and avoid crossing a silhouette or gap. Pick part/material to restrict overlapping source pieces.'],
  ['I want to continue from the other side', 'Draw: click the desired border edge. Strips: Ctrl-drag outward from that highlighted free end. Strokes: select the earlier outer rail, then draw beyond it; or select a cage border in Select first.'],
  ['The brush circle moves but the cage does not', 'Check pins, the protection mask, Borders: Pinned, source filtering and whether the pointer is over cyan cage geometry. Use Free borders only when boundary movement is intended.'],
  ['A number edit gives an error', 'Field edits apply on Enter or focus loss. A rejected value returns to its last accepted value; it does not complete a pending curve. Esc clears a recoverable popup error.'],
  ['Picking or contour cutting takes time', 'Picking prepares the dense source once. Explicit contour extraction can also take seconds. Use a part/material filter on overlapping or dense furniture; idle hover and orbit reuse the source cache.'],
];

export const limitations = [
  'Guide-driven strips and patches stay editable while their recipes remain attached. Direct topology edits can bake the affected guide region.',
  'Changing density across an existing shared seam can be rejected to preserve neighboring faces and protected vertices.',
  'The general solver does not fill arbitrary irregular holes, unequal-count boundaries, branching curve networks or pole layouts automatically.',
  'Selected-boundary spans are direct cage geometry, not rich tangent/variable-width guide handles.',
  'Source-centered symmetry needs an empty or compatible cage. General feature snapping, UV transfer and richer curve handles are future work.',
  'The overlay is translucent and front-facing; complex overlaps do not have full per-pixel masking. Restrict the source part when necessary.',
  '3ds Max 2026 is the current test platform. Maya support is planned and is not included in this beta.',
];

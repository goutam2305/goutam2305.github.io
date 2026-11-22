// About me page content.
const asset = (name) => `${import.meta.env?.BASE_URL ?? './'}assets/${name}`;

export const about = {
  photo: asset('about/portrait.jpg'),
  photoAlt: 'Portrait of Gowthaman.',
  lead: 'I’m Gowthaman, Goutam for short. An engineer who fell for 3D and never looked back.',
  intro: [
    'I’m a senior 3D artist based in Bangalore. Alongside my day job I build the things I wish I had: small tools, Unreal Engine projects and useful game assets.',
    'GOUTAM Lab is where all of it lives, the paid projects on Fab and the free tools you can download right here.',
  ],
  // Stops on the journey map, oldest first. The last one is "you are here".
  journey: [
    {
      id: 'engineer', short: 'Engineer', when: '2016', place: 'Final year of college',
      title: 'Engineering', role: 'Student',
      text: 'I trained as an engineer. In my final year I started exploring 3D on the side and got completely hooked.',
      tags: ['Engineering', 'First steps in 3D'],
    },
    {
      id: 'archviz', short: 'Archviz artist', when: '2016', place: 'First job',
      title: 'Architectural visualization', role: '3D archviz generalist',
      text: 'Straight after college I started working as a 3D archviz artist, turning drawings into rendered buildings and interiors.',
      tags: ['3ds Max', 'Archviz', 'Rendering'],
    },
    {
      id: 'selftaught', short: 'Self-taught', when: '2016 – 2018', place: 'Nights and weekends',
      title: 'Teaching myself to code', role: 'Learning while working',
      text: 'While working full time I taught myself Unreal Engine, C++ and Python. That is where the idea of building my own tools began.',
      tags: ['Unreal Engine', 'C++', 'Python'],
    },
    {
      id: 'generalist', short: '3D generalist', when: '2016 – 2018', place: 'Chennai',
      title: 'Making ads in Chennai', role: '3D generalist',
      text: 'I moved to a generalist role in Chennai, producing 3D for advertisements from modelling to final shots.',
      tags: ['3ds Max', 'Maya', 'Blender', 'Unreal Engine'],
    },
    {
      id: 'amazon', short: 'Amazon', when: '2018 – 2022', place: 'Amazon',
      title: 'Four and a half years at Amazon', role: '3D artist',
      text: 'In 2018 I joined Amazon as a 3D artist and spent four and a half years there, working at scale and to a high bar.',
      tags: ['Production 3D', 'Quality at scale'],
    },
    {
      id: 'startup', short: 'Game startup', when: '2022', place: 'Start-up',
      title: 'Leading 3D games at a start-up', role: '3D coordinator & project manager',
      text: 'I joined a newly formed crypto start-up and was in charge of its 3D games, coordinating the art and managing the projects. The company has since closed, but it taught me how to ship a whole project, not just the art.',
      tags: ['Game development', 'Project management', 'Unreal Engine'],
    },
    {
      id: 'now', short: 'Ashley Furniture', when: 'Now', place: 'Bangalore',
      title: 'Senior artist, and building tools', role: 'Senior 3D artist at Ashley Furniture',
      text: 'Today I develop furniture as 3D products at Ashley Furniture in Bangalore. In my own time I turn everything I have learned into tools and assets: EasyViewer for Unreal Engine and the E-Z tools for 3ds Max.',
      tags: ['Furniture 3D', 'Unreal tools', '3ds Max tools'],
      now: true,
    },
  ],
  offClock: [
    ['3D at home', 'Modelling for fun and printing the results. Some of my favourite projects never leave my desk.'],
    ['Scanning the real world', 'Turning everyday objects into 3D models with scanning, then seeing how far they can go.'],
    ['DIY electronics', 'Building my own small electronic tools and gadgets, learning one circuit at a time.'],
    ['Woodworking', 'Making things by hand in wood. A good break from pixels, and it still scratches the same itch.'],
    ['Exploring technology', 'New tools, new hardware, new ideas. If it is new, I want to try it.'],
    ['Games', 'Mostly on PC. Playing is a big part of why I wanted to make things for games.'],
    ['Badminton, football & long drives', 'The best ways I know to step away from the screen.'],
    ['Movies', 'I went to a Tamil-medium school and could barely speak English. Hollywood movies taught me the rest.'],
  ],
  next: {
    title: 'More tools. Free and paid.',
    text: [
      'More Unreal Engine projects and game assets are on the way, along with new free tools for 3D artists.',
      'Further ahead, I want to explore real-time rendering inside DCC applications.',
    ],
  },
};

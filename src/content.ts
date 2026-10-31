export type Role = 'student' | 'teacher';
export type Preset = 'worked' | 'guiding';
export const COURSE = 'Texas Hold’em';
export const COURSE_SUBTITLE = 'Think in Probabilities';
export const GITHUB = 'https://github.com/MAPS-research/kiwi';
export const SOURCES = [
  { title: 'PokerStars · The basics', description: 'Rules, terminology, and hand rankings', url: 'https://www.pokerstars.com/poker/learn/course/the-basics/' },
  { title: 'MIT OpenCourseWare · Poker study materials', description: 'An introduction to reasoning about probability', url: 'https://ocw.mit.edu/courses/15-s50-how-to-win-at-texas-holdem-poker-january-iap-2016/pages/study-materials/' },
];
export const LESSONS = [
  { title: 'Meet your hand', subtitle: 'A few cards. A little possibility.', duration: '1 min', label: 'The basics' },
  { title: 'Which cards help?', subtitle: 'Make the unknown a little more knowable.', duration: '2 min', label: 'Count the possibilities' },
  { title: 'One chance or two?', subtitle: 'Two draws. One surprisingly simple idea.', duration: '2 min', label: 'Think in probabilities' },
];
export const PRESETS: Record<Preset, { title: string; description: string; instruction: string }> = {
  worked: {
    title: 'Explain with a worked example',
    description: 'Connect the idea to the cards in front of the learner.',
    instruction: 'Use plain language and the current hand to explain probability. Walk through a small worked example, name your assumptions, and distinguish making a flush from winning the hand. For practice sheets, give hints rather than solutions.',
  },
  guiding: {
    title: 'Ask a guiding question first',
    description: 'Help the learner discover the next step themselves.',
    instruction: 'Start with one concrete question about the current hand. Encourage the learner to count known and unknown cards before giving an explanation. For practice sheets, give hints rather than solutions.',
  },
};
export const PROMPTS = [
  { id: 'flush', text: 'What makes a flush?', page: 0 },
  { id: 'nine', text: 'Why are there nine helpful cards?', page: 1 },
  { id: 'two', text: 'Why isn’t two draws exactly twice the chance?', page: 2 },
  { id: 'context', text: 'Explain the cards I’m looking at', page: 1 },
] as const;
export type PromptId = typeof PROMPTS[number]['id'];
export type TourStep = { title: string; body: string; screen: string; target: string; assistant?: boolean };
export const TOURS: Record<Role, TourStep[]> = {
  student: [
    { title: 'Start with the course material', body: 'Use the folder icon to open Class Materials. Choose a document, close the drawer, and use the page arrows to read. Kiwi’s help follows the material.', screen: 'materials', target: 'lesson' },
    { title: 'A little help, in context', body: 'Choose a question and select Send to try a scripted reply. Use Stop to keep a partial answer. Source links take you straight back to the relevant lesson page.', screen: 'materials', target: 'assistant', assistant: true },
    { title: 'Turn an idea into an experiment', body: 'Draw Lab is an example custom Kiwi App. Pick helpful cards, reveal the turn and river, and explore what changes.', screen: 'draw-lab', target: 'lab' },
    { title: 'There’s a teacher behind this experience', body: 'Switch perspectives to add a practice sheet, shape the guidance, or enable an app. Your changes carry across both views.', screen: 'materials', target: 'role-switch' },
  ],
  teacher: [
    { title: 'Give learning a shared starting point', body: 'The class has a short original lesson. Add the sample practice sheet and it will appear in the student’s Materials drawer.', screen: 'materials', target: 'teacher-materials' },
    { title: 'Shape how Kiwi helps', body: 'Choose an instruction example and save it. Future scripted student replies will use your selected teaching approach.', screen: 'edit-class', target: 'instructions' },
    { title: 'Make room for custom learning tools', body: 'Draw Lab is one example of a Kiwi App. Disable it in the table, or use Enable Apps to select it again. The student’s tabs update immediately.', screen: 'apps', target: 'apps' },
    { title: 'See what learners are asking', body: 'Explore topics, filter materials, and read sample questions. This is a fixed, fictional activity snapshot.', screen: 'analytics', target: 'analytics' },
  ],
};

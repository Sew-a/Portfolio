export const paths = {
    home: '/',
    work: '/work',
    microCanvas: '/work/micro-canvas',
    chatApp: '/work/chat-app',
    aiAgents: '/work/ai-agents',
    theTrip: '/work/the-trip',
    resume: '/resume',
    playground: '/playground',
    projects: '/projects',
    demos: '/demos',
    chat: '/chat',
    chatGroup: '/chat/:groupId',
    game: '/game',
}

export const routeNames = [
    { name: 'Main', path: paths.home },
    { name: 'Work', path: paths.work },
    { name: 'Demos', path: paths.demos },
    { name: 'Chat App', path: paths.chat },
    { name: 'Game', path: paths.game },
    { name: 'Resume', path: paths.resume },
]

export const chatGroupPath = (groupId: string) => `${paths.chat}/${encodeURIComponent(groupId)}`;

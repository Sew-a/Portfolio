export const paths = {
    home: '/',
    work: '/work',
    microCanvas: '/work/micro-canvas',
    chatApp: '/work/chat-app',
    aiAgents: '/work/ai-agents',
    resume: '/resume',
    playground: '/playground',
    projects: '/projects',
    demos: '/demos',
    chat: '/chat',
    chatGroup: '/chat/:groupId',
}

export const routeNames = [
    { name: 'Main', path: paths.home },
    { name: 'Work', path: paths.work },
    { name: 'Demos', path: paths.demos },
    { name: 'Chat App', path: paths.chat },
    { name: 'Resume', path: paths.resume },
]

export const chatGroupPath = (groupId: string) => `${paths.chat}/${encodeURIComponent(groupId)}`;

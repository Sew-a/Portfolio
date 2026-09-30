export const paths = {
    home: '/',
    work: '/work',
    formBuilder: '/work/form-builder',
    aiAgents: '/work/ai-agents',
    resume: '/resume',
    playground: '/playground',
    projects: '/projects',
    demos: '/demos',
    chat: '/chat',
    chatGroup: '/chat/:groupId',
}

export const routeNames = [
    { name: 'Portfolio', path: paths.home },
    { name: 'Work', path: paths.work },
    { name: 'Demos', path: paths.demos },
    { name: 'Chat', path: paths.chat },
    { name: 'Resume', path: paths.resume },
]

export const chatGroupPath = (groupId: string) => `${paths.chat}/${encodeURIComponent(groupId)}`;

// Note: process.env.XX are Vercel environment variables. See: https://docs.tangly1024.com/article/how-to-config-notion-next#c4768010ae7d44609b744e79e2f9959a

const BLOG = {
    API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3',
    // Important page_id!!! Duplicate Template from https://tanghh.notion.site/02ab3b8678004aa69e9e415905ef32a5
    NOTION_PAGE_ID:
          process.env.NOTION_PAGE_ID ||
          '07db71a7201283c2b125815a6bc5cb1b',
    THEME: process.env.NEXT_PUBLIC_THEME || 'simple',
    LANG: process.env.NEXT_PUBLIC_LANG || 'en-US',
    SINCE: process.env.NEXT_PUBLIC_SINCE || 2025,

    PSEUDO_STATIC: process.env.NEXT_PUBLIC_PSEUDO_STATIC || false,
    NEXT_REVALIDATE_SECOND: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 60,
    APPEARANCE: process.env.NEXT_PUBLIC_APPEARANCE || 'light',
    APPEARANCE_DARK_TIME: process.env.NEXT_PUBLIC_APPEARANCE_DARK_TIME || [18, 6],

    AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || 'LeadershipIntel',
    BIO: process.env.NEXT_PUBLIC_BIO || 'Leadership insights and resources',
    LINK: process.env.NEXT_PUBLIC_LINK || 'https://leadershipintel.vercel.app',
    DESCRIPTION: process.env.NEXT_PUBLIC_DESCRIPTION || '',
    KEYWORDS: process.env.NEXT_PUBLIC_KEYWORD || 'Leadership, Management, Notion, Blog',
    BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.ico',
    BEI_AN: process.env.NEXT_PUBLIC_BEI_AN || '',
    BEI_AN_LINK: process.env.NEXT_PUBLIC_BEI_AN_LINK || 'https://beian.miit.gov.cn/',
    BEI_AN_GONGAN: process.env.NEXT_PUBLIC_BEI_AN_GONGAN || '',

    // RSS
    ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || true,

    // Other complex configs split into /conf/ directory
    ...require('./conf/comment.config'),
    ...require('./conf/contact.config'),
    ...require('./conf/post.config'),
    ...require('./conf/analytics.config'),
    ...require('./conf/image.config'),
    ...require('./conf/font.config'),
    ...require('./conf/right-click-menu'),
    ...require('./conf/code.config'),
    ...require('./conf/animation.config'),
    ...require('./conf/widget.config'),
    ...require('./conf/ad.config'),
    ...require('./conf/plugin.config'),
    ...require('./conf/performance.config'),

    // Advanced usage
    ...require('./conf/layout-map.config'),
    ...require('./conf/notion.config'),
    ...require('./conf/dev.config'),

    // Custom external scripts and styles
    CUSTOM_EXTERNAL_JS: [''],
    CUSTOM_EXTERNAL_CSS: [''],

    // Custom menu
    CUSTOM_MENU: process.env.NEXT_PUBLIC_CUSTOM_MENU || true,

    // Post list settings
    CAN_COPY: process.env.NEXT_PUBLIC_CAN_COPY || true,

    // Sidebar layout reverse (left<->right)
    LAYOUT_SIDEBAR_REVERSE:
          process.env.NEXT_PUBLIC_LAYOUT_SIDEBAR_REVERSE || false,

    // Greeting words typing effect
    GREETING_WORDS:
          process.env.NEXT_PUBLIC_GREETING_WORDS ||
          'Welcome to LeadershipIntel, Your source for leadership insights, Resources for leaders and managers, Explore leadership content',

    // uuid redirect to slug
    UUID_REDIRECT: process.env.UUID_REDIRECT || false
}

module.exports = BLOG

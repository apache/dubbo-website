export default {
  rootPath: '', // 发布到服务器的根目录，需以/开头但不能有尾/，如果只有/，请填写空字符串
  port: 8080, // 本地开发服务器的启动端口
  domain: 'dubbo.apache.org', // 站点部署域名
  defaultSearch: 'google', // 默认搜索引擎，baidu或者google
  defaultLanguage: 'en-us',
  'en-us': {
    pageMenu: [
      {
        key: 'home', // 用作顶部菜单的选中
        text: 'HOME',
        link: '/en-us/index.html',
      },
      {
        key: 'docs',
        text: 'DOCS',
        link: '/en-us/docs/user/quick-start.html',
      },
      {
        key: 'developers',
        text: 'DEVELOPERS',
        link: '/en-us/docs/developers/developers_dev.html',
      },
      {
        key: 'blog',
        text: 'BLOG',
        link: '/en-us/blog/index.html',
      },
      {
        key: 'community',
        text: 'COMMUNITY',
        link: '/en-us/community/index.html',
      },
      {
        key: 'download',
        text: 'DOWNLOAD',
        link: '/en-us/blog/download.html',
      },
    ],
    disclaimer: {
      title: '',
      content: '',
    },
    asf: {
      title: 'ASF',
      list: [
        {
          text: 'Foundation',
          link: 'http://www.apache.org',
        },
        {
          text: 'License',
          link: 'http://www.apache.org/licenses/',
        },
        {
          text: 'Events',
          link: 'http://www.apache.org/events/current-event',
        },
        {
          text: 'Sponsorship',
          link: 'http://www.apache.org/foundation/sponsorship.html',
        },
        {
          text: 'Thanks',
          link: 'http://www.apache.org/foundation/thanks.html',
        },
      ],
    },
    documentation: {
      title: 'Documentation',
      list: [
        {
          text: 'Quick start',
          link: '/en-us/docs/user/quick-start.html',
        },
        {
          text: 'Developer guide',
          link: '/en-us/docs/dev/build.html',
        },
        {
          text: 'Admin manual',
          link: '/en-us/docs/admin/ops/dubbo-ops.html',
        },
        {
          text: 'Report a Doc Issue',
          link: 'https://github.com/apache/dubbo-website/issues/new',
        },
        {
          text: 'Edit This Page on GitHub',
          link: 'https://github.com/apache/dubbo-website',
        },
      ],
    },
    resources: {
      title: 'Resources',
      list: [
        {
          text: 'Blog',
          link: '/en-us/blog/index.html',
        },
        {
          text: 'Community',
          link: '/en-us/community/index.html',
        },
        {
            text: 'Security',
            link: 'https://www.apache.org/security/',
        },
      ],
    },
    copyright: 'Copyright © 2018-2019 The Apache Software Foundation. Apache and the Apache feather logo are trademarks of The Apache Software Foundation.',
  },
  'zh-cn': {
    pageMenu: [
      {
        key: 'home',
        text: '首页',
        link: '/zh-cn/index.html',
      },
      {
        key: 'docs',
        text: '文档',
        link: '/zh-cn/docs/user/quick-start.html',
      },
      {
        key: 'developers',
        text: '开发者',
        link: '/zh-cn/docs/developers/developers_dev.html',
      },
      {
        key: 'blog',
        text: '博客',
        link: '/zh-cn/blog/index.html',
      },
      {
        key: 'community',
        text: '社区',
        link: '/zh-cn/community/index.html',
      },
      {
        key: 'download',
        text: '下载',
        link: '/zh-cn/blog/download.html',
      },
    ],
    disclaimer: {
      title: '',
      content: '',
    },
    asf: {
      title: 'ASF',
      list: [
        {
          text: '基金会',
          link: 'http://www.apache.org',
        },
        {
          text: '证书',
          link: 'http://www.apache.org/licenses/',
        },
        {
          text: '事件',
          link: 'http://www.apache.org/events/current-event',
        },
        {
          text: '赞助',
          link: 'http://www.apache.org/foundation/sponsorship.html',
        },
        {
          text: '致谢',
          link: 'http://www.apache.org/foundation/thanks.html',
        },
      ],
    },
    documentation: {
      title: '文档',
      list: [
        {
          text: '快速开始',
          link: '/zh-cn/docs/user/quick-start.html',
        },
        {
          text: '开发者指南',
          link: '/zh-cn/docs/dev/build.html',
        },
        {
          text: '运维管理',
          link: '/zh-cn/docs/admin/ops/dubbo-ops.html',
        },
        {
          text: '报告文档问题',
          link: 'https://github.com/apache/dubbo-website/issues/new',
        },
        {
          text: '编辑此文档',
          link: 'https://github.com/apache/dubbo-website',
        },
      ]
    },
    resources: {
      title: '资源',
      list: [
        {
          text: '博客',
          link: '/zh-cn/blog/index.html',
        },
        {
          text: '社区',
          link: '/zh-cn/community/index.html',
        },
        {
            text: '安全',
            link: 'https://www.apache.org/security',
        }
      ]
    },
    copyright: 'Copyright © 2018-2019 The Apache Software Foundation. Apache and the Apache feather logo are trademarks of The Apache Software Foundation.'
  }
};

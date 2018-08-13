export default {
  rootPath: '', // 发布到服务器的根目录，需以/开头但不能有尾/，如果只有/，请填写空字符串
  port: 8080, // 本地开发服务器的启动端口
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
        key: 'blog',
        text: 'BLOG',
        link: '/en-us/blog/index.html',
      },
      {
        key: 'community',
        text: 'COMMUNITY',
        link: '/en-us/community/index.html',
      },
    ],
    disclaimer: {
      title: 'Disclaimer',
      content: 'Apache Dubbo is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.',
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
      ],
    },
    copyright: 'Copyright © 2018 The Apache Software Foundation. Apache and the Apache feather logo are trademarks of The Apache Software Foundation.',
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
        key: 'blog',
        text: '博客',
        link: '/zh-cn/blog/index.html',
      },
      {
        key: 'community',
        text: '社区',
        link: '/zh-cn/community/index.html',
      }
    ],
    disclaimer: {
      title: 'Disclaimer',
      content: 'Apache Dubbo is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.',
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
        }
      ]
    },
    copyright: 'Copyright © 2018 The Apache Software Foundation. Apache and the Apache feather logo are trademarks of The Apache Software Foundation.'
  }
};

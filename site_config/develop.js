export default {
  'en-us': {
    sidemenu: [
      {
        children: [
          {
            title: 'How to contribute',
            language: '/en-us/docs/developers/guide_dev.html', // 开发者文档均以_dev结尾作为文件名，md文件放在docs目录下
          },
          {
              title: 'Developers',
              language: '/en-us/docs/developers/developers_dev.html',
          },
        ],
      }
    ],
    barText: 'Developers',
  },
  'zh-cn': {
    sidemenu: [
      {
        children: [
          {
            title: '参与贡献',
            language: '/zh-cn/docs/developers/guide_dev.html',
          },
          {
              title: '开发人员',
              language: '/zh-cn/docs/developers/developers_dev.html',
          }
        ],
      }
    ],
    barText: '开发者',
  }
};

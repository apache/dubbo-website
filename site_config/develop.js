export default {
  'en-us': {
    sidemenu: [
      {
        children: [
          {
            title: 'developer1',
            language: '/en-us/docs/developers/developer1_dev.html', // 开发者文档均以_dev结尾作为文件名，md文件放在docs目录下
          }
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
            title: '开发者1',
            language: '/zh-cn/docs/developers/developer1_dev.html',
          }
        ],
      }
    ],
    barText: '开发者',
  }
};

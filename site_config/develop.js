export default {
    'en-us': {
        sidemenu: [
            {
                title: 'User Guide',
                children: [
                    {
                        title: 'FAQ',
                        link: '/en-us/docs/developers/user-guide/faq_dev.html',
                    }
                ]
            },
            {
                title: 'Contribute Guide',
                children: [
                    {
                        title: 'New contributor guide',
                        link: '/en-us/docs/developers/contributor-guide/new-contributor-guide_dev.html',
                    },
                    {
                        title: 'Software donation guide',
                        link: '/en-us/docs/developers/contributor-guide/software-donation-guide_dev.html',
                    },
                    {
                        title: 'Test coverage guide',
                        link: '/en-us/docs/developers/contributor-guide/test-coverage-guide_dev.html',
                    },
                    {
                        title: 'Mailing list subscription guide',
                        link: '/en-us/docs/developers/contributor-guide/cla-signing-guide_dev.html',
                    }
                    ,
                    {
                        title: 'CLA Signing Guide',
                        link: '/en-us/docs/developers/contributor-guide/mailing-list-subscription-guide_dev.html',
                    }
                    ,
                    {
                        title: 'Extension guide',
                        link: '/en-us/docs/developers/contributor-guide/dubbo-extension-guide_dev.html',
                    }
                ]
            },
            {
                title: 'Committer Guide',
                children: [
                    {
                        title: 'New Committer guide',
                        link: '/en-us/docs/developers/committer-guide/new-committer-guide_dev.html',
                    },
                    {
                        title: 'Label an Issue',
                        link: '/en-us/docs/developers/committer-guide/label-an-issue-guide_dev.html',
                    },
                    {
                        title: 'Website Guide',
                        link: '/en-us/docs/developers/committer-guide/website-guide_dev.html',
                    }
                ]
            },
            {
                children: [
                    {
                        title: 'How to contribute',
                        link: '/en-us/docs/developers/guide_dev.html', // 开发者文档均以_dev结尾作为文件名，md文件放在docs目录下
                    },
                    {
                        title: 'Developers',
                        link: '/en-us/docs/developers/developers_dev.html',
                    },
                ],
            }
        ],
        barText: 'Developers',
    },
    'zh-cn':
        {
            sidemenu: [
                {
                    title: 'User Guide',
                    children: [
                        {
                            title: 'FAQ',
                            link: '/zh-cn/docs/developers/user-guide/faq_dev.html',
                        }
                    ]
                },
                {
                    title: '贡献者向导',
                    children: [
                        {
                            title: '新贡献者向导',
                            link: '/zh-cn/docs/developers/contributor-guide/new-contributor-guide_dev.html',
                        },
                        {
                            title: '软件捐献向导',
                            link: '/zh-cn/docs/developers/contributor-guide/software-donation-guide_dev.html',
                        },
                        {
                            title: '测试覆盖率向导',
                            link: '/zh-cn/docs/developers/contributor-guide/test-coverage-guide_dev.html',
                        },
                        {
                            title: '邮件列表订阅向导',
                            link: '/zh-cn/docs/developers/contributor-guide/cla-signing-guide_dev.html',
                        }
                        ,
                        {
                            title: 'CLA签署向导',
                            link: '/zh-cn/docs/developers/contributor-guide/mailing-list-subscription-guide_dev.html',
                        }
                        ,
                        {
                            title: 'Dubbo Extension向导',
                            link: '/zh-cn/docs/developers/contributor-guide/dubbo-extension-guide_dev.html',
                        }
                    ]
                },
                {
                    title: '提交者向导',
                    children: [
                        {
                            title: 'Apache提交者注册流程',
                            link: '/zh-cn/docs/developers/committer-guide/new-committer-guide_dev.html',
                        },
                        {
                            title: '给问题打标签',
                            link: '/zh-cn/docs/developers/committer-guide/label-an-issue-guide_dev.html',
                        },
                        {
                            title: '网站向导',
                            link: '/zh-cn/docs/developers/committer-guide/website-guide_dev.html',
                        }
                    ]
                },
                {
                    children: [
                        {
                            title: '参与贡献',
                            link: '/zh-cn/docs/developers/guide_dev.html',
                        },
                        {
                            title: '开发人员',
                            link: '/zh-cn/docs/developers/developers_dev.html',
                        }
                    ],
                }
            ],
            barText:
                '开发者',
        }
}
;

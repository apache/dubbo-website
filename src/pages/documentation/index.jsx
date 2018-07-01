import React from 'react';
import cookie from 'js-cookie';
import { scroller } from 'react-scroll';
import path from 'path';
import qs from 'querystring';
import { Redirect } from 'react-router-dom';
import Language from '../../components/language';
import Header from '../../components/header';
import Bar from '../../components/bar';
import Sidemenu from '../../components/sidemenu';
import Footer from '../../components/footer';
import siteConfig from '../../../site_config/site';
import docsConfig from '../../../site_config/docs';
import docsData from '../../../md_json/docs.json';
import './index.scss';

// 锚点正则
const anchorReg = /^#[^/]/;
// 相对地址正则，包括./、../、直接文件夹名称开头、直接文件开头
const relativeReg = /^((\.{1,2}\/)|([\w-]+[/.]))/;

class Documentation extends Language {

  componentDidMount() {
    if (!this.markdownContainer) {
      // 如果进入重定向，直接返回
      return;
    }
    // 因单页的缘故，需要滚动到页面顶部，否则原先页面滚动位置不会变
    window.scrollTo && window.scrollTo(0, 0);
    // 可能带有语言版本，所以有split('?')[0]
    const filename = this.props.match.url.split('?')[0].split('/').slice(2).join('/');
    // 获取当前文档所在的部分的相对路径，除去文件名
    const relativePath = filename.split('/').slice(0, -1).join('/');
    const hashSearch = window.location.hash.split('?');
    const search = qs.parse(hashSearch[1] || '');
    const language = search.lang || cookie.get('docsite_language') || siteConfig.defaultLanguage;
    const imgs = Array.from(this.markdownContainer.querySelectorAll('img'));
    const alinks = Array.from(this.markdownContainer.querySelectorAll('a'));
    imgs.forEach((img) => {
      const src = img.getAttribute('src');
      if (relativeReg.test(src)) {
        img.src = `${window.location.protocol}//${window.location.host}${path.join(window.location.pathname, './docs', language, relativePath, src)}`;
      }
    });
    alinks.forEach((alink) => {
      const href = alink.getAttribute('href');
      if (relativeReg.test(href)) {
        alink.href = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#/${path.join('./docs', relativePath, href)}`;
      }
    });
    this.markdownContainer.addEventListener('click', (e) => {
      const isAnchor = e.target.nodeName.toLowerCase() === 'a' && e.target.getAttribute('href') && anchorReg.test(e.target.getAttribute('href'));
      if (isAnchor) {
        e.preventDefault();
        const id = e.target.getAttribute('href').slice(1);
        scroller.scrollTo(id, {
          duration: 1000,
          smooth: 'easeInOutQuint',
        });
      }
    });
  }

  componentDidUpdate() {
    // 需要加上这个，否则点击浏览器回退时，componentDidMount不触发
    this.componentDidMount();
  }

  render() {
    const hashSearch = window.location.hash.split('?');
    const search = qs.parse(hashSearch[1] || '');
    let language = search.lang || cookie.get('docsite_language') || siteConfig.defaultLanguage;
    // 防止链接被更改导致错误的cookie存储
    if (language !== 'en-us' && language !== 'zh-cn') {
      language = siteConfig.defaultLanguage;
    }
    // 同步cookie和search上的语言版本
    if (language !== cookie.get('docsite_language')) {
      cookie.set('docsite_language', language, { expires: 365, path: '' });
    }
    if (!search.lang) {
      return <Redirect to={`${this.props.match.url}?lang=${language}`} />;
    }
    const dataSource = docsConfig[language];
    const filename = this.props.match.url.split('/').slice(2).join('/');
    const md = docsData[language].find(doc => doc.filename === filename);
    const __html = md && md.__html ? md.__html : '';
    return (
      <div className="documentation-page">
        <Header type="normal" logo="./img/dubbo_colorful.png" language={language} onLanguageChange={this.onLanguageChange} />
        <Bar img="./img/docs.png" text={dataSource.barText} />
        <section className="content-section">
          <Sidemenu dataSource={dataSource.sidemenu} />
          <div
            className="doc-content markdown-body"
            ref={(node) => { this.markdownContainer = node; }}
            dangerouslySetInnerHTML={{ __html }}
          />
        </section>
        <Footer logo="./img/dubbo_gray.png" />
      </div>
    );
  }
}

export default Documentation;

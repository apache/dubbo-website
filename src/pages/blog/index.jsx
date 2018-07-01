import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import cookie from 'js-cookie';
import qs from 'querystring';
import Language from '../../components/language';
import Header from '../../components/header';
import Bar from '../../components/bar';
import PageSlider from '../../components/pageSlider';
import BlogItem from './blogItem';
import Footer from '../../components/footer';
import blogConfig from '../../../site_config/blog';
import siteConfig from '../../../site_config/site';
import './index.scss';

class Blog extends Language {

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
    const dataSource = blogConfig[language];
    const blogs = dataSource.list;
    return (
      <div className="blog-list-page">
        <Header type="normal" logo="./img/dubbo_colorful.png" language={language} onLanguageChange={this.onLanguageChange} />
        <Bar img="./img/blog.png" text={dataSource.barText} />
        <section className="blog-container">
          <div className="col col-18 left-part">
            <PageSlider pageSize={5}>
            {
              blogs.map((blog, i) => (
                <BlogItem key={i} dataSource={blog} />
              ))
            }
            </PageSlider>
          </div>
          <div className="col col-6 right-part">
            <h4>{dataSource.postsTitle}</h4>
            <ul>
            {
              blogs.map((blog, i) => (
                <li key={i}><Link to={blog.link}><span>{blog.dateStr}&nbsp;&nbsp;</span><span>{blog.title}</span></Link></li>
              ))
            }
            </ul>
          </div>
        </section>
        <Footer logo="./img/dubbo_gray.png" />
      </div>
    );
  }
}

export default Blog;

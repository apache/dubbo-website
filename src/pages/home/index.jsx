import React from 'react';
import ReactDOM from 'react-dom';
import cookie from 'js-cookie';
import { getScrollTop, getLink } from '../../../utils';
import Header from '../../components/header';
import Button from '../../components/button';
import Footer from '../../components/footer';
import Language from '../../components/language';
import Item from './featureItem';
import siteConfig from '../../../site_config/site';
import homeConfig from '../../../site_config/home';
import './index.scss';

class Home extends Language {

  constructor(props) {
    super(props);
    this.state = {
      headerType: 'primary',
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', () => {
      const scrollTop = getScrollTop();
      if (scrollTop > 66) {
        this.setState({
          headerType: 'normal',
        });
      } else {
        this.setState({
          headerType: 'primary',
        });
      }
    });
  }

  render() {
    let urlLang;
    if (window.rootPath) {
      urlLang = window.location.pathname.split('/')[2];
    } else {
      urlLang = window.location.pathname.split('/')[1];
    }
    let language = this.props.lang || urlLang || cookie.get('docsite_language') || siteConfig.defaultLanguage;
    // 防止链接被更改导致错误的cookie存储
    if (language !== 'en-us' && language !== 'zh-cn') {
      language = siteConfig.defaultLanguage;
    }
    // 同步cookie语言版本
    if (language !== cookie.get('docsite_language')) {
      cookie.set('docsite_language', language, { expires: 365, path: '' });
    }
    const dataSource = homeConfig[language];
    const { headerType } = this.state;
    const headerLogo = headerType === 'primary' ? `${window.rootPath}/img/dubbo_white.png` : `${window.rootPath}/img/dubbo_colorful.png`;
    return (
      <div className="home-page">
        <section className="top-section">
          <Header
            currentKey="home"
            type={headerType}
            logo={headerLogo}
            language={language}
            onLanguageChange={this.onLanguageChange}
          />
          <div className="vertical-middle">
            <img src={`${window.rootPath}/img/dubbo.png`} />
            <div className="product-name">
              <h2>{dataSource.brand.brandName}</h2>
              <img src={`${window.rootPath}/img/incubating.svg`} />
            </div>
            <p className="product-desc">{dataSource.brand.briefIntroduction}</p>
            <div className="button-area">
              <a className="button" href={getLink(dataSource.brand.getStartedButton.link)}>{dataSource.brand.getStartedButton.text}</a>
              <Button type="primary" link={getLink(dataSource.brand.viewOnGithubButton.link)}>{dataSource.brand.viewOnGithubButton.text}</Button>
            </div>
          </div>
          <div className="animation animation1" />
          <div className="animation animation2" />
          <div className="animation animation3" />
          <div className="animation animation4" />
          <div className="animation animation5" />
        </section>
        <section className="introduction-section">
          <div className="introduction-body">
            <div className="introduction">
              <h3>{dataSource.introduction.title}</h3>
              <p>{dataSource.introduction.desc}</p>
            </div>
            <img src={`${window.rootPath}${dataSource.introduction.img}`} />
          </div>
        </section>
        <section className="feature-section">
          <h3>{dataSource.features.title}</h3>
          <ul>
          {
            dataSource.features.list.map((feature, i) => (
              <Item feature={feature} key={i} />
            ))
          }
          </ul>
        </section>
        <section className="start-section">
          <div className="start-body">
            <div className="left-part">
              <h3>{dataSource.start.title}</h3>
              <p>{dataSource.start.desc}</p>
              <a href={getLink(dataSource.start.button.link)}>{dataSource.start.button.text}</a>
              </div>
            <div className="right-part"><img src={`${window.rootPath}/img/quick_start.png`} /></div>
          </div>
        </section>
        <section className="users-section">
          <h3>{dataSource.users.title}</h3>
          <p>{dataSource.users.desc}</p>
          <div className="users">
          {
            dataSource.users.list.map((user, i) => (
              <img src={`${window.rootPath}${user}`} key={i} />
            ))
          }
          </div>
        </section>
        <Footer logo={`${window.rootPath}/img/dubbo_gray.png`} />
      </div>
    );
  }
}

document.getElementById('root') && ReactDOM.render(<Home />, document.getElementById('root'));

export default Home;

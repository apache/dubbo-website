import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch'; // fetch polyfill
import { getScrollTop, getLink } from '../../../utils';
import Header from '../../components/header';
import Button from '../../components/button';
import Footer from '../../components/footer';
import Language from '../../components/language';
import Item from './featureItem';
import homeConfig from '../../../site_config/home';
import './index.scss';

class Home extends Language {

  constructor(props) {
    super(props);
    this.state = {
      headerType: 'primary',
      starCount: 0,
      forkCount: 0,
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
    fetch('//api.github.com/repos/apache/incubator-dubbo')
      .then(res => res.json())
      .then((data) => {
        this.setState({
          starCount: data.stargazers_count,
          forkCount: data.forks_count,
        });
      });
  }

  render() {
    const { starCount, forkCount } = this.state;
    const language = this.getLanguage();
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
              <Button type="primary" link={getLink(dataSource.brand.getStartedButton.link)}>{dataSource.brand.getStartedButton.text}</Button>
              <Button type="normal" link={getLink(dataSource.brand.viewOnGithubButton.link)}>{dataSource.brand.viewOnGithubButton.text}</Button>
            </div>
            <div className="github-buttons">
                <a href="https://github.com/apache/incubator-dubbo" target="_blank" rel="noopener noreferrer">
                  <div className="star">
                    <img src="https://img.alicdn.com/tfs/TB1FlB1JwHqK1RjSZFPXXcwapXa-32-32.png" />
                    <span className="count">{starCount}</span>
                  </div>
                </a>
                <a href="https://github.com/apache/incubator-dubbo/fork" target="_blank" rel="noopener noreferrer">
                <div className="fork">
                  <img src="https://img.alicdn.com/tfs/TB1zbxSJwDqK1RjSZSyXXaxEVXa-32-32.png" />
                  <span className="count">{forkCount}</span>
                </div>
                </a>
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

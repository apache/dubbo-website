import React from 'react';
import ReactDOM from 'react-dom';
import cookie from 'js-cookie';
import Language from '../../components/language';
import Header from '../../components/header';
import Bar from '../../components/bar';
import Slider from '../../components/slider';
import EventCard from './eventCard';
import ContactItem from './contactItem';
import ContributorItem from './contributorItem';
import EcoItem from './ecoItem';
import Footer from '../../components/footer';
import siteConfig from '../../../site_config/site';
import communityConfig from '../../../site_config/community.jsx';

import './index.scss';

class Community extends Language {

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
    // 同步cookie的语言版本
    if (language !== cookie.get('docsite_language')) {
      cookie.set('docsite_language', language, { expires: 365, path: '' });
    }
    const dataSource = communityConfig[language];
    return (
      <div className="community-page">
      <Header
        currentKey="community"
        type="normal"
        logo={`${window.rootPath}/img/dubbo_colorful.png`}
        language={language}
        onLanguageChange={this.onLanguageChange}
      />
      <Bar img={`${window.rootPath}/img/community.png`} text={dataSource.barText} />
        <section className="events-section">
          <h3>{dataSource.events.title}</h3>
          <Slider>
            {dataSource.events.list.map((event, i) => (
              <EventCard event={event} key={i} />
            ))}
          </Slider>
        </section>
        <section className="eco-section">
          <h3>{dataSource.ecos.title}</h3>
          <div className="eco-lists">
          {
            dataSource.ecos.list.map((eco, i) => (
              <EcoItem eco={eco} key={i} />
            ))
          }
          </div>
        </section>
        <section className="contact-section">
          <h3>{dataSource.contacts.title}</h3>
          <p>{dataSource.contacts.desc}</p>
          <div className="contact-list">
          {
            dataSource.contacts.list.map((contact, i) => (
              <ContactItem contact={contact} key={i} />
            ))
          }
          </div>
        </section>
        <section className="contributor-section">
          <h3>{dataSource.contributorGuide.title}</h3>
          <p>{dataSource.contributorGuide.desc}</p>
          <div className="contributor-list">
          {
            dataSource.contributorGuide.list.map((contributor, i) => (
              <ContributorItem contributor={contributor} key={i} />
            ))
          }
          </div>
        </section>
        <Footer logo={`${window.rootPath}/img/dubbo_gray.png`} />
      </div>
    );
  }
}

document.getElementById('root') && ReactDOM.render(<Community />, document.getElementById('root'));

export default Community;

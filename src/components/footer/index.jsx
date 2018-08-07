import React from 'react';
import cookie from 'js-cookie';
import { Link } from 'react-router-dom';
import siteConfig from '../../../site_config/site';
import './index.scss';

const Footer = (props) => {
  const language = cookie.get('docsite_language') || siteConfig.defaultLanguage;
  const dataSource = siteConfig[language];
  return (
    <footer className="footer-container">
      <div className="footer-body">
        <img src={props.logo} />
        <img className="apache" src="./img/apache_logo.png" />
        <div className="cols-container">
          <div className="col col-12">
            <h3>{dataSource.disclaimer.title}</h3>
            <p>{dataSource.disclaimer.content}</p>
          </div>
          <div className="col col-6">
            <dl>
              <dt>{dataSource.documentation.title}</dt>
              {
                dataSource.documentation.list.map((d, i) => (
                  <dd key={i}><Link to={d.link}>{d.text}</Link></dd>
                ))
              }
            </dl>
          </div>
          <div className="col col-6">
          <dl>
          <dt>{dataSource.resources.title}</dt>
          {
            dataSource.resources.list.map((d, i) => (
              <dd key={i}><Link to={d.link}>{d.text}</Link></dd>
            ))
          }
          </dl>
          </div>
        </div>
        <div className="copyright"><span>{dataSource.copyright}</span></div>
      </div>
    </footer>
  );
};

export default Footer;

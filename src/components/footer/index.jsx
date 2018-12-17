import React from 'react';
import PropTypes from 'prop-types';
import cookie from 'js-cookie';
import siteConfig from '../../../site_config/site';
import { getLink } from '../../../utils';
import './index.scss';

const propTypes = {
  logo: PropTypes.string.isRequired, // logo地址
};

class Footer extends React.Component {

  render() {
    const { logo } = this.props;
    const language = cookie.get('docsite_language') || siteConfig.defaultLanguage;
    const dataSource = siteConfig[language];
    return (
      <footer className="footer-container">
        <div className="footer-body">
          <img src={logo} />
          <img className="apache" src={`${window.rootPath}/img/apache_logo.png`} />
          <div className="cols-container">
            <div className="col col-12">
              <h3>{dataSource.disclaimer.title}</h3>
              <p>{dataSource.disclaimer.content}</p>
            </div>
            <div className="col col-4">
              <dl>
                <dt>{dataSource.asf.title}</dt>
                {
                  dataSource.asf.list.map((d, i) => (
                    <dd key={i}><a href={getLink(d.link)} target={d.target || '_self'}>{d.text}</a></dd>
                  ))
                }
              </dl>
            </div>
            <div className="col col-4">
              <dl>
                <dt>{dataSource.documentation.title}</dt>
                {
                  dataSource.documentation.list.map((d, i) => (
                    <dd key={i}><a href={getLink(d.link)} target={d.target || '_self'}>{d.text}</a></dd>
                  ))
                }
              </dl>
            </div>
            <div className="col col-4">
            <dl>
            <dt>{dataSource.resources.title}</dt>
            {
              dataSource.resources.list.map((d, i) => (
                <dd key={i}><a href={getLink(d.link)} target={d.target || '_self'}>{d.text}</a></dd>
              ))
            }
            </dl>
            </div>
          </div>
          <div className="copyright"><span>{dataSource.copyright}</span></div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = propTypes;

export default Footer;

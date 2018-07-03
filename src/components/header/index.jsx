import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { autobind } from 'core-decorators';
import siteConfig from '../../../site_config/site';
import './index.scss';

const languageSwitch = [
  {
    text: '中',
    value: 'en-us',
  },
  {
    text: 'En',
    value: 'zh-cn',
  },
];
const noop = () => {};

const defaultProps = {
  type: 'primary',
  language: 'en-us',
  onLanguageChange: noop,
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuBodyVisible: false,
      language: props.language,
    };
  }

  @autobind
  toggleMenu() {
    this.setState({
      menuBodyVisible: !this.state.menuBodyVisible,
    });
  }

  @autobind
  switchLang() {
    let language;
    if (this.state.language === 'zh-cn') {
      language = 'en-us';
    } else {
      language = 'zh-cn';
    }
    this.setState({
      language,
    });
    this.props.onLanguageChange(language);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      language: nextProps.language,
    });
  }

  render() {
    const { type, logo, onLanguageChange } = this.props;
    const { menuBodyVisible, language } = this.state;
    return (
      <header
        className={
          classnames({
            'header-container': true,
            [`header-container-${type}`]: true,
          })
        }
      >
        <div className="header-body">
          <Link to="/">
            <img className="logo" alt={siteConfig.name} title={siteConfig.name} src={logo} />
          </Link>
          {
            onLanguageChange !== noop ?
            (<span
              className={
                classnames({
                  'language-switch': true,
                  [`language-switch-${type}`]: true,
                })
              }
              onClick={this.switchLang}
            >
              {languageSwitch.find(lang => lang.value === language).text}
            </span>)
            :
            null
          }
          <div
            className={
              classnames({
                'header-menu': true,
                'header-menu-open': menuBodyVisible,
              })
            }
          >
            <img
              className="header-menu-toggle"
              onClick={this.toggleMenu}
              src={type === 'primary' ? './img/menu_white.png' : './img/menu_gray.png'}
            />
            <ul>
              {siteConfig[language].pageMenu.map(item => (
                <li
                  className={classnames({
                    'menu-item': true,
                    [`menu-item-${type}`]: true,
                    [`menu-item-${type}-active`]: window.location.hash.split('?')[0].slice(1).split('/')[1] === item.link.split('/')[1],
                  })}
                >
                  <Link to={item.link}>{item.text}</Link>
                </li>))}
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

Header.defaultProps = defaultProps;
export default Header;

import React from 'react';
import { autobind } from 'core-decorators';
import cookie from 'js-cookie';

export default class Language extends React.Component {
  @autobind
  onLanguageChange(language) {
    const pathname = window.location.pathname;
    let oldLang;
    if (language === 'zh-cn') {
      oldLang = 'en-us';
    } else {
      oldLang = 'zh-cn';
    }
    const newPathname = pathname.replace(`${window.rootPath}/${oldLang}`, `${window.rootPath}/${language}`);
    cookie.set('docsite_language', language, { expires: 365, path: '' });
    window.location = newPathname;
  }
}

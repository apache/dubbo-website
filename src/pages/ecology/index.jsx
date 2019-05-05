import React from 'react';
import ReactDOM from 'react-dom';
import Language from '../../components/language';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ecologyConfig from '../../../site_config/ecology';
import Memo from './memo';
import Card from './card';
import ImgItem from './img-item';
import { getLink } from '../../../utils';
import './index.scss';

class Ecology extends Language {
  render() {
    const language = this.getLanguage();
    const dataSource = ecologyConfig[language];
    return (
      <div className="ecology-page">
        <Header
          type="normal"
          currentKey="ecology"
          logo={getLink('/img/dubbo_colorful.png')}
          language={language}
          onLanguageChange={this.onLanguageChange}
        />
        <section className="eco-container">
          <h4 className="eco-title">{dataSource.title}</h4>
          <p className="eco-desc">{dataSource.desc}</p>
          <div className="eco-body">
            <div className="left-part">
              {
                dataSource.body.slice(0, -1).map(d => (
                  <Memo key={d.title} title={d.title} bgColor={d.bgColor}>
                    {
                      d.children.map(sd => (
                        <Card key={sd.title} title={sd.title}>
                          {
                            sd.children.map(ssd => (
                              <ImgItem key={ssd.name} dataSource={ssd} />
                            ))
                          }
                        </Card>
                      ))
                    }
                  </Memo>
                ))
              }
            </div>
            {
              dataSource.body.length > 1 ?
              <div className="right-part">
                {
                  dataSource.body.slice(-1).map(d => (
                    <Memo key={d.title} vertical title={d.title} bgColor={d.bgColor}>
                      {
                        d.children.map(sd => (
                          <Card key={sd.title} title={sd.title}>
                            {
                              sd.children.map(ssd => (
                                <ImgItem key={ssd.name} dataSource={ssd} />
                              ))
                            }
                          </Card>
                        ))
                      }
                    </Memo>
                  ))
                }
              </div>
              : null
            }
          </div>
        </section>
        <Footer logo={getLink('/img/dubbo_gray.png')} />
      </div>
    );
  }
}

document.getElementById('root') && ReactDOM.render(<Ecology />, document.getElementById('root'));

export default Ecology;

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import asyncComponent from './components/asyncComponent';

import './index.scss';

const Home = asyncComponent(() => import('./pages/home'));
const Community = asyncComponent(() => import('./pages/community'));
const Blog = asyncComponent(() => import('./pages/blog'));
const BlogDetail = asyncComponent(() => import('./pages/blogDetail'));
const Documentation = asyncComponent(() => import('./pages/documentation'));

class App extends React.Component {

  render() {
    // 最后两个未用模板参数的原因是路径深度不一定
    return (
      <HashRouter hashType="hashbang">
        <Switch>
          <Redirect exact from="/docs" to="/docs/user/quick-start.md" />
          <Redirect exact from="/docs/" to="/docs/user/quick-start.md" />
          <Route exact path="/" component={Home} />
          <Route exact path="/community" component={Community} />
          <Route exact path="/blog" component={Blog} />
          <Route path="/blog/*" component={BlogDetail} />
          <Route path="/docs/*" component={Documentation} />
        </Switch>
      </HashRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

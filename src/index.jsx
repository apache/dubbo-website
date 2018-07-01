import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/home';
import Community from './pages/community';
import Blog from './pages/blog';
import BlogDetail from './pages/blogDetail';
import Documentation from './pages/documentation';
import './index.scss';

class App extends React.Component {
  render() {
    // 最后两个未用模板参数的原因是路径深度不一定
    return (
      <HashRouter>
        <Switch>
          <Redirect exact from="/docs" to="/docs/quick-start.md" />
          <Redirect exact from="/docs/" to="/docs/quick-start.md" />
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

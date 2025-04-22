1. add deps：
> npm i react@18.2.0 react-dom@18.2.0 html-webpack-plugin babel-loader @babel/core @babel/preset-env @babel/preset-react  webpack webpack-cli webpack-dev-server

2. add .babelrc
处理react的编译

3. webpack.config.js
指定打包出system库

4. 自己实现一个简化版ajSystemJs
  1. System.import   开始加载一个本地模块
  2. 第一步处理关系映射表
  3. 加载需要处理的依赖
  4. 依赖全部加载完后，每个依赖会在全局(window)上添加一个对应属性，此时使用快照的方式得到这个属性
  5. 执行渲染逻辑


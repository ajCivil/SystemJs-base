// 自定义实现一个简化版 System.js
// 1. 有一个System.register(依赖列表，回调函数返回一个setters,execute)
// 2. react/ react-dom 加载后调用setters，将对应的结果赋值给webpack
// 3. 执行execute

class ajSystemJs {

  //存储importmap中的映射关系
  newMapUrl = {}

  // 注册后的结果做一次保存，等待文件加载完后在做处理
  lastRegister
  /**
   * 处理script；得到importmap中的映射关系表
   */
  processScript() {
    Array.from(document.querySelectorAll('script')).forEach(script => {
      if (script.type === 'systemjs-importmap') {
        const imports = JSON.parse(script.innerHTML).imports;
        Object.entries(imports).forEach(([key, value]) => {
          this.newMapUrl[key] = value;
        });
      }
    })
  }

  /**
   * 加载script模块
   */
  load(id) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = this.newMapUrl[id] || id
      script.async = true
      script.onload = () => {
        resolve() //加载完成后会执行代码
      }
      document.head.appendChild(script)
    })
  }

  /**
   * 导入模块
   * @param {*} id 依赖模块， 可以是本地模块，也可以是远程模块
   * @returns 返回一个promise
   */
  import(id) {
    return Promise.resolve(this.processScript())
      .then(() => {
        //1. 去当前路径找对应的文件，转成绝对路径
        const lastSepIndex = location.href.lastIndexOf('/')
        const baseUrl = location.href.substring(0, lastSepIndex + 1)
        if (id.startsWith('./')) {
          return baseUrl + id.substring(2)
        }
      })
      .then(id => {
        //id: 资源路径
        return this.load(id)
      })
  }


  /**
   * 注册方法
   * @param {*} deps 依赖列表
   * @param {*} declare 回调函数
   */
  register(deps, callback) {
    this.lastRegister = [deps, callback]
    console.log('register', deps, callback)
    Promise.all(deps.map(dep=> this.load(dep))).then(()=>{
      const { setters, execute } = callback()
      deps.forEach((dep, index) => {
        setters[index](dep)
      })
      execute()
    })
   }

}
const ajSystem = new ajSystemJs;
window.System = ajSystem;
// 自定义实现一个简化版 System.js
// 1. 有一个System.register(依赖列表，回调函数返回一个setters,execute)
// 2. react/ react-dom 加载后调用setters，将对应的结果赋值给webpack
// 3. 执行execute

/**
 * 本质就是先加载依赖列表， 再去加载真正的逻辑
 * 内部通过script脚本加载资源，给window拍照保存先后状态
 */

class ajSystemJs {

  constructor(){
    this.saveGlobalProtertity()
  }

  //存储importmap中的映射关系
  newMapUrl = {}

  // 注册后的结果做一次保存，等待文件加载完后可以执行处理
  lastRegister

  // window全局变量快照
  globalPropertitySet = new Set()

  /**
   * 保存window对象快照
   */
  saveGlobalProtertity(){
    for(let key in window){
      this.globalPropertitySet.add(key)
    }
  }

  /**
   * 获取window上的全局属性
   * 使用的是沙箱的快照方案
   * @returns 
   */
    getLastGlobalProtertity(){
      for(let key in window){
        if(this.globalPropertitySet.has(key) || key == 'System') {
          continue
        }
        this.globalPropertitySet.add(key)
        return window[key]
      }
    }

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
      script.src = this.newMapUrl[id] || id   //支持CND远程文件查找、本地文件查找
      script.async = true
      script.onload = () => {
         //加载完成后会执行代码，会调用 System.register()
        let _lastRegister = this.lastRegister
        this.lastRegister = undefined
        resolve(_lastRegister)
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
    //1. 去当前路径找对应的文件，转成绝对路径
      .then(() => {
        const lastSepIndex = location.href.lastIndexOf('/')
        const baseUrl = location.href.substring(0, lastSepIndex + 1)
        if (id.startsWith('./')) {
          return baseUrl + id.substring(2)
        }
      })
      //id: 资源路径
      //1. 根据id加载资源
      //2. 加载后执行文件内的代码
      //  2.1 先处理需要用到是属性
      //  2.2 执行变量存储
      //  2.3 执行渲染逻辑
      .then(id => {
        let execute
        return this.load(id).then((register)=>{
          //setters： 用来保存加载后的资源
          //execute 是真正执行的渲染逻辑
          let {setters, execute:exec} = register[1](()=>{})
          execute = exec 
          return [register[0], setters]
        }).then(([registeration, setters])=>{ 
          //需要等到所有依赖加载完毕后，才继续下一步去执行渲染逻辑
          return Promise.all(registeration.map((dep, i)=>{       
            return this.load(dep).then(()=>{
              //远程模块加载完毕后，会在window上增添属性
              //window.React   window.ReactDOM
              let propertity = this.getLastGlobalProtertity()
              setters[i](propertity)
            })
          }))
        }).then(()=>{
          execute()
          console.log('模块加载完成')
        })
      })
  }


  /**
   * 注册方法
   * @param {*} deps 依赖列表
   * @param {*} declare 回调函数， 返回一个 { setters, execute }
   */
  register(deps, callback) {
    // console.log('register', deps, callback)
    //将回调的结果保存起来
    this.lastRegister = [deps, callback]
    // Promise.all(deps.map(dep=> this.load(dep))).then(()=>{
    //   const { setters, execute } = callback()
    //   deps.forEach((dep, index) => {
    //     setters[index](dep)
    //   })
    //   execute()
    // })
   }

}
const ajSystem = new ajSystemJs;
window.System = ajSystem;

//封装插件
(function (window) {
    //创建并全局化 Vue 构造函数对象
    window.Vue = function Vue(options) {
        //data 成员变量
        this.data = options.data;
        //备份 this
        var self = this;

        //遍历 data 声明的数据进行绑定
        Object.keys(this.data).forEach(function (key) {
            defineReactive(self, key, self.data[key]);
        });

        //对 DOM 进行解析、编译
        var id = options.el;
        var dom = nodeToFragment(document.querySelector(id), this);
        document.querySelector(id).appendChild(dom);
    };

    //响应式的数据绑定
    function defineReactive(obj, key, val) {
        //实例化 共同主题对象（发布者） 构造函数对象
        var dep = new Dep();

        //通过 访问属性 劫持数据
        Object.defineProperty(obj, key, {
            //获取属性值时 记录每个观察者订阅消息
            get: function () {
                if (Dep.target) dep.addSub(Dep.target);
                return val;
            },
            //设置属性值时 发布者发出消息通知全部观察者更新视图
            set: function (newVal) {
                if (val === newVal) return;
                val = newVal;
                dep.notify();
            }
        })
    }

    //对 DOM 所有节点进行解析、编译并返回新的 DOM
    function nodeToFragment(node, vm) {
        //创建 新的文档片段
        var flag = document.createDocumentFragment();
        var child;

        //遍历所有子节点
        while (child = node.firstChild) {
            //解析节点
            compile(child, vm);
            //劫持解析后的节点
            flag.appendChild(child);
        }

        return flag;
    }

    //解析并编译 DOM 节点
    function compile(node, vm) {
        //插值符号 正则表达式
        var reg = /\{\{(.*)\}\}/;

        //节点类型为元素
        if (node.nodeType === 1) {
            var attr = node.attributes;

            //解析属性
            for (var i=0; i<attr.length; i++) {
                if (attr[i].nodeName === 'v-model') {
                    var key = attr[i].nodeValue;

                    //输入框监听事件触发 data 更新
                    node.addEventListener('input', function (e) {
                        //触发相应属性的 setter
                        vm[key] = e.target.value;
                    });
                    //实例化 观察者 构造函数对象，同时触发订阅事件
                    new Watcher(vm, node, key);
                    node.removeAttribute('v-model');
                }
            }
        }

        //节点类型为文本
        if (node.nodeType === 3) {
            if (reg.test(node.nodeValue)) {
                var key = RegExp.$1;

                key = key.trim();
                //实例化 观察者 构造函数对象，同时触发订阅事件
                new Watcher(vm, node, key);
            }
        }
    }

    //发布者 构造函数对象
    function Dep() {
        this.subs = [];
    }

    Dep.prototype = {
        addSub: function (sub) {
            //队列中添加 单个观察者实例对象
            this.subs.push(sub);
        },
        notify: function () {
            //调用队列中全部观察者实例对象的 update()
            this.subs.forEach(function (sub) {
                sub.update();
            })
        }
    };

    //观察者 构造函数对象
    function Watcher(vm, node, key) {
        Dep.target = this;
        this.key = key;
        this.node = node;
        this.vm = vm;
        this.update();
        //Dep.target 设为空。因为它是全局变量，也是 watcher 与 dep 关联的唯一桥梁，任何时刻都必须保证 Dep.target 只有一个值
        Dep.target = null;
    }

    Watcher.prototype = {
        update: function () {
            //触发相应属性的 getter
            this.value = this.vm[this.key];
            console.log(this.vm[this.key]);
            this.node.nodeValue = this.value;
            this.node.value = this.value;
        }
    };
})(window);

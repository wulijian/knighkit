/**
 * @date 12-2-13
 * @describe: 实现简单的观察者模式（事件） 具备以下功能：
 * 1. 基本的观察者模式
 * 2. 可方便的移除某个通知
 * 3. 可控制通知观察者的顺序
 * 4. 异步
 * @author: wulj
 * @version: 1.0
 */

(function (window) {
    var KEvent = function () {
        this.mudules = {};
        this.listeners = {};
    };
    var handleTypeAndNs = function (typeAndNs) {
        var type = typeAndNs.split('.');
        var tns = {};
        tns.etype = type[0];
        if (type.length === 2) {
            tns.ns = type[1];
        }
        return tns;
    };
    var eidx = 0;

    KEvent.prototype = {
        constructor: KEvent,
        /**
         * on('pageLoad.indexPage',function(){});
         * @param type      观察类型
         * @param listener  观察者
         */
        on: function (type, listener) {
            var tns = handleTypeAndNs(type);//将类型和命名空间分割开
            var etype = tns.etype, ns = tns.ns;
            if (typeof this.listeners[etype] === 'undefined') {
                this.listeners[etype] = {};
            }
            this.listeners[etype]['__eidx_' + eidx] = listener;
            listener.eidx = '__eidx_' + eidx;
            if (ns !== undefined) {   //相同命名空间下的 listener 的索引，放到以 ns为 key 的数组中
                if (typeof this.mudules[ns] === 'undefined') {
                    this.mudules[ns] = [];
                }
                this.mudules[ns].push('__eidx_' + eidx);
            }
            eidx++;
        },
        /**
         * 解除以下通知
         * @param type
         * @param listener
         */
        un: function (type, listener) {
            if (typeof type === 'undefined') {
                this.listeners = {};
                this.mudules = {};
                return;
            }

            var tns = handleTypeAndNs(type);
            var etype = tns.etype, ns = tns.ns;

            if (this.listeners[etype] !== undefined) {
                var listeners = this.listeners[etype];
                var listenerIdxInNs = this.mudules[ns];
                for (var i = 0, len = listenerIdxInNs.length; i < len; i++) {
                    listeners[listenerIdxInNs[i]] = null;
                }
                if (!!listener && !!listener.eidx) {
                    listeners[listener.eidx] = null;
                }
            }
        },
        /**
         * 触发事件
         * @param event
         */
        fire: function (event) {
            if (typeof event === 'string') {
                event = { type: event};
            }
            if (!event.target) {
                event.target = this;
            }
            if (!event.type) {
                throw new Error('Event Object missing type property');
            }
            if (this.listeners[event.type] !== null) {
                var listeners = this.listeners[event.type];
                for (var idx in listeners) {
                    if (listeners.hasOwnProperty(idx) && listeners[idx] !== null) {
                        listeners[idx].apply(this, Array.prototype.slice.call(arguments, 1));
                    }
                }
            }
        }
    };

    var ke = function (id) {
        /**
         * 创建一个ID号为{id}的事件对象
         * @param id 事件对象的id
         */
        if (typeof KEvent[id] === 'undefined') {
            KEvent[id] = new KEvent(id);
        }
        return KEvent[id];
    };
    if (typeof module !== 'undefined' && module.exports !== 'undefined') {
        module.exports = ke;
    } else if (typeof define === 'function') {
        define(function () {
            return ke;
        });
    }
    ((typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document) ? window : global).ke = ke;

}(this));
(function () {
    'use strict';

    window._core = window._core||{};
    window._core.DesignService = DesignService;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return DesignService;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = DesignService
    }

    function DesignService() {
        var increment5 = [null, 0, 5, 10, 15, 20, 25, 30, 33, 35, 40, 45, 50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100],
            flex = ['flex'].concat(increment5),
            layoutOptions = {
                "breakpoints": ['all', 'xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl'],
                "mediaQueries": ['all', '0~599', '600~959', '960~1279', '1280~1919', '>1920'],
                "layout": {
                    "flex": flex,
                    "flex-offset": increment5,
                    "layout": [null, 'row', 'column'],
                    "layout-align": {
                        x: [null, 'start', 'center', 'end', 'space-around', 'space-between'],
                        y: [null, 'start', 'center', 'end', 'stretch']
                    }
                }
            },
            emptyTags = {
                area: 1,
                base: 1,
                basefont: 1,
                br: 1,
                col: 1,
                frame: 1,
                hr: 1,
                img: 1,
                input: 1,
                isindex: 1,
                link: 1,
                meta: 1,
                param: 1,
                embed: 1
            };

        function isEmptyTag(name) {
            if (name.charAt(0) == '?') {
                return true;
            }
            if (name.charAt(0) == '/') {
                name = name.substring(1);
            }
            return !!emptyTags[name];
        }


        function buildLayoutClass(layouts) {
            var res = '';

            for(var breakpoint in layouts){
                var layout = layouts[breakpoint];
                for(var key in layout){
                    var value = layout[key];
                    if (value === null) return;
                    var _value = '-' + value + ' ',
                        fullname = key + (breakpoint === 'all')? '' : '-' + breakpoint;
                    switch (key) {
                        case 'flex':
                            if (value === 'flex') _value = ' ';
                            break;
                        case 'flex-offset':
                        case 'flex-order':
                        case 'layout':
                        case 'layout-align':
                            var x = (value.x? '-'+value.x: '');
                            var y = (value.y? '-'+value.y: '');
                            _value = x+y+' ';
                            break;
                        default:
                            fullname = value ? fullname + ' ' : '';
                            _value = ''; //ex layout-fill:true will become layout-fill
                            break;
                    }
                    res += fullname + _value;
                }
            }
            return res;
        }

        //the followings only work properly after getAllTemplates() is resolved, remember to add resolve property of this on the state config file.
        function compileElement(item) {
            item = item || {};
            var content,
                tag = item.tag || 'div',
                singleton = isEmptyTag(tag),
                type = item.type;

            if (item.content) {
                content = item.content;
                if (type === 'text') return content;
            } else if (type === 'tag') { //tag without content;
                content = '<!--include-->'
            } else {
                content = '';
            }

            var res = '';
            if (item.id) {
                res += 'id="' + item.id + '" '
            }

            if (item.class) {
                res += ' class="' + item.class + ' ' + buildLayoutClass(item.layout) + '"';
            }
            if (item.style) {
                res += ' style="' + item.style + '"';
            }
            if (item.attrs) {
                res += ' ' + item.attrs;
            }
            if (item.ctrl) {
                res += ' ng-controller="' + item.ctrl + ' as ' + (item.ctrlAs || 'vm') + '"';
            }

            if (tag.search('/') !== -1) singleton = true;
            content = "<--tag-- --custom-->" + (singleton ? "" : content + "<--endtag-->");
            content = content.replace('--custom--', res);
            content = content.replace('--tag--', tag);
            content = content.replace('--endtag--', '/' + tag);

            return content
        }


        function compile(containers) {
            var html = '';
            containers.forEach(function (container) {
                var rawContainer = compileElement(container);
                html += rawContainer.replace('<!--include-->', container.divs ? compile(container.divs) : '');
            });
            return html;
        }

        function compileAll(containers, canvas) {
            var _canvas = Object.assign({}, canvas || {});
            _canvas.content = '<!--include-->';
            _canvas.tag = 'md-content';
            _canvas.style = _canvas.style || '';
            return compileElement(_canvas).replace('<!--include-->', compile(containers))
        }

        function isAttrsConfigurable(html) {
            return html.search('!--custom--') !== -1;
        }

        function isTagConfigurable(html) {
            return html.search('!--tag--') !== -1 && html.search('!--endtag--') !== -1;
        }

        return {
            layoutOptions: layoutOptions,
            compile: compile,
            compileAll: compileAll,
            compileElement: compileElement,
            isAttrsConfigurable: isAttrsConfigurable,
            isTagConfigurable: isTagConfigurable
        }
    }
    return DesignService
})();


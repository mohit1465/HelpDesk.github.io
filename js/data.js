const suggestions = {
    common: {
        html: {
            'default':'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document from PrimeX</title>\n</head>\n<body>\n  \n</body>\n</html>',
            '<!DOCTYPE html>': '<!DOCTYPE html>',
            'html': '<html></html>',
            'head': '<head></head>',
            'title': '<title></title>',
            'base': '<base>',
            'link': '<link rel="stylesheet" href="">',
            'meta': '<meta>',
            'style': '<style></style>',
            'script': '<script></script>',
            'noscript': '<noscript></noscript>',
            'body': '<body></body>',
            'section': '<section></section>',
            'nav': '<nav></nav>',
            'article': '<article></article>',
            'h1': '<h1></h1>',
            'h2': '<h2></h2>',
            'h3': '<h3></h3>',
            'h4': '<h4></h4>',
            'h5': '<h5></h5>',
            'h6': '<h6></h6>',
            'header': '<header></header>',
            'footer': '<footer></footer>',
            'address': '<address></address>',
            'p': '<p></p>',
            'hr': '<hr>',
            'pre': '<pre></pre>',
            'blockquote': '<blockquote></blockquote>',
            'ol': '<ol></ol>',
            'ul': '<ul></ul>',
            'li': '<li></li>',
            'dl': '<dl></dl>',
            'dt': '<dt></dt>',
            'dd': '<dd></dd>',
            'figcaption': '<figcaption></figcaption>',
            'div': '<div></div>',
            'a': '<a href=""></a>',
            'em': '<em></em>',
            'strong': '<strong></strong>',
            'small': '<small></small>',
            's': '<s></s>',
            'cite': '<cite></cite>',
            'q': '<q></q>',
            'dfn': '<dfn></dfn>',
            'abbr': '<abbr></abbr>',
            'time': '<time></time>',
            'code': '<code></code>',
            'var': '<var></var>',
            'samp': '<samp></samp>',
            'kbd': '<kbd></kbd>',
            'sub': '<sub></sub>',
            'sup': '<sup></sup>',
            'i': '<i></i>',
            'b': '<b></b>',
            'u': '<u></u>',
            'mark': '<mark></mark>',
            'rb': '<rb></rb>',
            'bdo': '<bdo dir=""></bdo>',
            'span': '<span></span>',
            'br': '<br>',
            'wbr': '<wbr>',
            'ins': '<ins></ins>',
            'del': '<del></del>',
            'picture': '<picture></picture>',
            'source': '<source>',
            'img': '<img src="" alt="">',
            'embed': '<embed>',
            'object': '<object></object>',
            'param': '<param>',
            'video': '<video controls></video>',
            'audio': '<audio controls></audio>',
            'track': '<track>',
            'map': '<map name=""></map>',
            'area': '<area>',
            'table': '<table></table>',
            'caption': '<caption></caption>',
            'colgroup': '<colgroup></colgroup>',
            'col': '<col>',
            'thead': '<thead></thead>',
            'tbody': '<tbody></tbody>',
            'tfoot': '<tfoot></tfoot>',
            'tr': '<tr></tr>',
            'td': '<td></td>',
            'th': '<th></th>',
            'form': '<form></form>',
            'label': '<label></label>',
            'input': '<input>',
            'button': '<button></button>',
            'select': '<select></select>',
            'datalist': '<datalist></datalist>',
            'optgroup': '<optgroup></optgroup>',
            'option': '<option></option>',
            'textarea': '<textarea></textarea>',
            'fieldset': '<fieldset></fieldset>',
            'legend': '<legend></legend>',
            'summary': '<summary></summary>',
            'menu': '<menu></menu>',
            'menuitem': '<menuitem>',
            'slot': '<slot></slot>',
            'template': '<template></template>',
            'canvas': '<canvas></canvas>',
            'svg': '<svg></svg>',
            'math': '<math></math>',
            'iframe': '<iframe></iframe>',
            'main': '<main></main>',
            'aside': '<aside></aside>',
            'dialog': '<dialog></dialog>',
            'data': '<data></data>',
            'output': '<output></output>',
            'progress': '<progress></progress>',
            'meter': '<meter></meter>',
            'figure': '<figure></figure>',
            'details': '<details></details>',
            'ruby': '<ruby></ruby>',
            'rt': '<rt></rt>',
            'rp': '<rp></rp>',
            'bdi': '<bdi></bdi>',
            'keygen': '<keygen>',

            //attributes

            'id': 'id=""',
            'class': 'class=""',
            'src': 'src=""',
            'alt': 'alt=""',
            'href': 'href=""',
            'target': 'target=""',
            'rel': 'rel=""',
            'type': 'type=""',
            'name': 'name=""',
            'value': 'value=""',
            'placeholder': 'placeholder=""',
            'checked': 'checked',
            'disabled': 'disabled',
            'readonly': 'readonly',
            'multiple': 'multiple',
            'selected': 'selected',
            'autoplay': 'autoplay',
            'controls': 'controls',
            'loop': 'loop',
            'muted': 'muted',
            'download': 'download',
            'async': 'async',
            'defer': 'defer',
            'charset': 'charset=""',
            'content': 'content=""',
            'http-equiv': 'http-equiv=""',
            'media': 'media=""',
            'sizes': 'sizes=""',
            'srcset': 'srcset=""',
            'data-*': 'data-*=""',
            'aria-*': 'aria-*=""',
            'role': 'role=""',
            'tabindex': 'tabindex=""',
            'autofocus': 'autofocus',
            'maxlength': 'maxlength=""',
            'minlength': 'minlength=""',
            'required': 'required',
            'novalidate': 'novalidate',
            'pattern': 'pattern=""',
            'accept': 'accept=""',
            'autocomplete': 'autocomplete=""',
            'enctype': 'enctype=""',
            'method': 'method=""',
            'action': 'action=""',
            'form': 'form=""',
            'for': 'for=""',
            'list': 'list=""',
            'min': 'min=""',
            'max': 'max=""',
            'step': 'step=""'
        },

        css: {
            'color': 'color: ;',
            'background-color': 'background-color: ;',
            'font-size': 'font-size: ;',
            'font-family': 'font-family: ;',
            'margin': 'margin: ;',
            'padding': 'padding: ;',
            'width': 'width: ;',
            'height': 'height: ;',
            'border': 'border: ;',
            'border-radius': 'border-radius: ;',
            'display': 'display: ;',
            'position': 'position: ;',
            'top': 'top: ;',
            'right': 'right: ;',
            'bottom': 'bottom: ;',
            'left': 'left: ;',
            'float': 'float: ;',
            'clear': 'clear: ;',
            'overflow': 'overflow: ;',
            'text-align': 'text-align: ;',
            'line-height': 'line-height: ;',
            'vertical-align': 'vertical-align: ;',
            'z-index': 'z-index: ;',
            'opacity': 'opacity: ;',
            'visibility': 'visibility: ;',
            'cursor': 'cursor: ;',
            'box-shadow': 'box-shadow: ;',
            'text-shadow': 'text-shadow: ;',
            'transition': 'transition: ;',
            'transform': 'transform: ;',
            'animation': 'animation: ;',
            'content': 'content: ;',
            'list-style': 'list-style: ;',
            'flex': 'flex: ;',
            'flex-direction': 'flex-direction: ;',
            'align-items': 'align-items: ;',
            'justify-content': 'justify-content: ;',
            'grid-template-columns': 'grid-template-columns: ;',
            'grid-template-rows': 'grid-template-rows: ;',
            'gap': 'gap: ;',
            'object-fit': 'object-fit: ;',
            'filter': 'filter: ;',
            'background-image': 'background-image: url();',
            'background-position': 'background-position: ;',
            'background-size': 'background-size: ;',
            'box-sizing': 'box-sizing: ;',
            'max-width': 'max-width: ;',
            'min-width': 'min-width: ;',
            'max-height': 'max-height: ;',
            'min-height': 'min-height: ;',
            'transition-duration': 'transition-duration: ;',
            'transition-timing-function': 'transition-timing-function: ;',
            'text-decoration': 'text-decoration: ;',
            'font-weight': 'font-weight: ;',
            'font-style': 'font-style: ;',
            'letter-spacing': 'letter-spacing: ;',
            'word-spacing': 'word-spacing: ;',
            'clip-path': 'clip-path: ;',
            'overflow-x': 'overflow-x: ;',
            'overflow-y': 'overflow-y: ;',
            'white-space': 'white-space: ;',
            'word-wrap': 'word-wrap: ;',
            'border-collapse': 'border-collapse: ;',
            'border-spacing': 'border-spacing: ;',
            'table-layout': 'table-layout: ;',
            'caption-side': 'caption-side: ;'
        },

        js: {
            'document.getElementById': 'document.getElementById("");',
            'document.querySelector': 'document.querySelector("");',
            'document.querySelectorAll': 'document.querySelectorAll("");',
            'addEventListener': 'element.addEventListener("event", function() {});',
            'removeEventListener': 'element.removeEventListener("event", function() {});',
            'classList.add': 'element.classList.add("");',
            'classList.remove': 'element.classList.remove("");',
            'classList.toggle': 'element.classList.toggle("");',
            'innerHTML': 'element.innerHTML = "";',
            'innerText': 'element.innerText = "";',
            'textContent': 'element.textContent = "";',
            'style': 'element.style.property = "";',
            'setAttribute': 'element.setAttribute("attribute", "value");',
            'getAttribute': 'element.getAttribute("attribute");',
            'removeAttribute': 'element.removeAttribute("attribute");',
            'createElement': 'document.createElement("");',
            'appendChild': 'parent.appendChild(element);',
            'removeChild': 'parent.removeChild(element);',
            'insertBefore': 'parent.insertBefore(newElement, referenceElement);',
            'replaceChild': 'parent.replaceChild(newElement, oldElement);',
            'alert': 'alert("");',
            'console.log': 'console.log("");',
            'setTimeout': 'setTimeout(function() {}, milliseconds);',
            'setInterval': 'setInterval(function() {}, milliseconds);',
            'clearTimeout': 'clearTimeout(timeoutID);',
            'clearInterval': 'clearInterval(intervalID);',
            'fetch': 'fetch("url").then(function(response) {}).catch(function(error) {});',
            'localStorage.setItem': 'localStorage.setItem("key", "value");',
            'localStorage.getItem': 'localStorage.getItem("key");',
            'localStorage.removeItem': 'localStorage.removeItem("key");',
            'sessionStorage.setItem': 'sessionStorage.setItem("key", "value");',
            'sessionStorage.getItem': 'sessionStorage.getItem("key");',
            'sessionStorage.removeItem': 'sessionStorage.removeItem("key");',
            'JSON.parse': 'JSON.parse("");',
            'JSON.stringify': 'JSON.stringify(object);',
            'Math.random': 'Math.random();',
            'Math.floor': 'Math.floor(number);',
            'Math.ceil': 'Math.ceil(number);',
            'Math.round': 'Math.round(number);',
            'Date': 'new Date();',
            'getDate': 'date.getDate();',
            'getMonth': 'date.getMonth();',
            'getFullYear': 'date.getFullYear();',
            'getHours': 'date.getHours();',
            'getMinutes': 'date.getMinutes();',
            'getSeconds': 'date.getSeconds();'
        },

        python: {
            'print': 'print("")',
            'len': 'len(sequence)',
            'range': 'range(start, stop, step)',
            'type': 'type(variable)',
            'int': 'int(value)',
            'float': 'float(value)',
            'str': 'str(value)',
            'list': 'list()',
            'dict': 'dict()',
            'set': 'set()',
            'tuple': 'tuple()',
            'input': 'input("")',
            'open': 'open("filename", "mode")',
            'read': 'file.read()',
            'write': 'file.write("")',
            'close': 'file.close()',
            'append': 'list.append(item)',
            'remove': 'list.remove(item)',
            'pop': 'list.pop()',
            'sort': 'list.sort()',
            'reverse': 'list.reverse()',
            'join': '"separator".join(list)',
            'split': 'string.split("separator")',
            'upper': 'string.upper()',
            'lower': 'string.lower()',
            'replace': 'string.replace("old", "new")',
            'strip': 'string.strip()',
            'find': 'string.find("substring")',
            'import': 'import module',
            'from': 'from module import something',
            'def': 'def function_name(parameters):',
            'return': 'return value',
            'if': 'if condition:',
            'elif': 'elif condition:',
            'else': 'else:',
            'for': 'for item in iterable:',
            'while': 'while condition:',
            'try': 'try:',
            'except': 'except exception:',
            'finally': 'finally:',
            'class': 'class ClassName:',
            'self': 'self',
            'init': '__init__(self, parameters)',
            'lambda': 'lambda arguments: expression',
            'map': 'map(function, iterable)',
            'filter': 'filter(function, iterable)',
            'reduce': 'reduce(function, iterable)',
            'isinstance': 'isinstance(object, classinfo)',
            'hasattr': 'hasattr(object, "attribute")',
            'getattr': 'getattr(object, "attribute")',
            'setattr': 'setattr(object, "attribute", value)',
            'dir': 'dir(object)',
            'help': 'help(object)'
        },

        java: {
            'System.out.println': 'System.out.println("");',
            'System.out.print': 'System.out.print("");',
            'String.length': 'string.length();',
            'String.toUpperCase': 'string.toUpperCase();',
            'String.toLowerCase': 'string.toLowerCase();',
            'String.equals': 'string.equals("otherString");',
            'String.charAt': 'string.charAt(index);',
            'String.substring': 'string.substring(start, end);',
            'Array.length': 'array.length;',
            'ArrayList.add': 'arrayList.add(item);',
            'ArrayList.get': 'arrayList.get(index);',
            'ArrayList.remove': 'arrayList.remove(index);',
            'ArrayList.size': 'arrayList.size();',
            'HashMap.put': 'hashMap.put(key, value);',
            'HashMap.get': 'hashMap.get(key);',
            'HashMap.remove': 'hashMap.remove(key);',
            'HashMap.size': 'hashMap.size();',
            'for': 'for (int i = 0; i < limit; i++) {}',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'else if': 'else if (condition) {}',
            'switch': 'switch (expression) {}',
            'case': 'case value: break;',
            'default': 'default: break;',
            'while': 'while (condition) {}',
            'do': 'do {} while (condition);',
            'try': 'try {}',
            'catch': 'catch (Exception e) {}',
            'finally': 'finally {}',
            'class': 'class ClassName {}',
            'public': 'public',
            'private': 'private',
            'protected': 'protected',
            'static': 'static',
            'void': 'void',
            'return': 'return value;',
            'new': 'new ClassName();',
            'this': 'this',
            'super': 'super()',
            'import': 'import package.ClassName;',
            'package': 'package packageName;',
            'public static void main': 'public static void main(String[] args) {}',
            'int': 'int variable = value;',
            'double': 'double variable = value;',
            'boolean': 'boolean variable = value;',
            'char': 'char variable = \"value\";',
            'String': 'String variable = "value";'
        },

        cpp: {
            'cout': 'std::cout << "";',
            'cin': 'std::cin >> variable;',
            'return': 'return value;',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'else if': 'else if (condition) {}',
            'switch': 'switch (expression) {}',
            'case': 'case value: break;',
            'default': 'default: break;',
            'for': 'for (int i = 0; i < limit; i++) {}',
            'while': 'while (condition) {}',
            'do': 'do {} while (condition);',
            'try': 'try {}',
            'catch': 'catch (exception) {}',
            'finally': 'finally {}',
            'class': 'class ClassName {}',
            'public': 'public:',
            'private': 'private:',
            'protected': 'protected:',
            'int': 'int variable = value;',
            'double': 'double variable = value;',
            'char': 'char variable = \'value\';',
            'string': 'std::string variable = "value";',
            'new': 'new ClassName();',
            'delete': 'delete pointer;',
            'this': 'this',
            'namespace': 'namespace Name {}',
            'struct': 'struct StructName {};',
            'friend': 'friend',
            'virtual': 'virtual',
            'template': 'template<typename T>',
            'sizeof': 'sizeof(variable)',
            'static': 'static',
            'const': 'const',
            'auto': 'auto variable = value;',
            'nullptr': 'nullptr',
            'operator': 'operator'
        },

        ruby: {
            'puts': 'puts ""',
            'print': 'print ""',
            'gets': 'gets',
            'chomp': 'string.chomp',
            'to_i': 'string.to_i',
            'to_s': 'number.to_s',
            'to_f': 'string.to_f',
            'each': 'array.each { |item| }',
            'map': 'array.map { |item| }',
            'select': 'array.select { |item| condition }',
            'reject': 'array.reject { |item| condition }',
            'find': 'array.find { |item| condition }',
            'reduce': 'array.reduce(0) { |sum, item| sum + item }',
            'length': 'array.length',
            'size': 'array.size',
            'first': 'array.first',
            'last': 'array.last',
            'push': 'array.push(item)',
            'pop': 'array.pop',
            'shift': 'array.shift',
            'unshift': 'array.unshift(item)',
            'include?': 'array.include?(item)',
            'delete': 'array.delete(item)',
            'slice': 'array.slice(start, length)',
            'split': 'string.split("separator")',
            'join': 'array.join("separator")',
            'upcase': 'string.upcase',
            'downcase': 'string.downcase',
            'capitalize': 'string.capitalize',
            'strip': 'string.strip',
            'gsub': 'string.gsub(/pattern/, "replacement")',
            'times': 'number.times { }',
            'loop': 'loop { }',
            'break': 'break',
            'next': 'next',
            'return': 'return value'
        },

        c: {
            'printf': 'printf("");',
            'scanf': 'scanf("");',
            'int': 'int variable = value;',
            'float': 'float variable = value;',
            'double': 'double variable = value;',
            'char': 'char variable = \'value\';',
            'return': 'return value;',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'else if': 'else if (condition) {}',
            'switch': 'switch (expression) {}',
            'case': 'case value: break;',
            'default': 'default: break;',
            'for': 'for (int i = 0; i < limit; i++) {}',
            'while': 'while (condition) {}',
            'do': 'do {} while (condition);',
            'break': 'break;',
            'continue': 'continue;',
            'void': 'void functionName() {}',
            'static': 'static',
            'const': 'const',
            'sizeof': 'sizeof(variable)',
            'malloc': 'malloc(size)',
            'calloc': 'calloc(num, size)',
            'free': 'free(pointer)',
            'struct': 'struct StructName {};',
            'typedef': 'typedef existingType newType;',
            'union': 'union UnionName {};',
            'enum': 'enum EnumName {VALUE1, VALUE2};',
            'define': '#define name value',
            'include': '#include <header.h>',
            'int main': 'int main() {}',
            'NULL': 'NULL',
            'puts': 'puts("");',
            'gets': 'gets(variable);',
            'fopen': 'FILE *fopen("filename", "mode");',
            'fclose': 'fclose(filePointer);',
            'fwrite': 'fwrite(data, size, count, filePointer);',
            'fread': 'fread(buffer, size, count, filePointer);',
            'fprintf': 'fprintf(filePointer, "format", data);',
            'fscanf': 'fscanf(filePointer, "format", &data);'
        },

        swift: {
            'print': 'print("")',
            'let': 'let variable = value',
            'var': 'var variable = value',
            'if': 'if condition {}',
            'else': 'else {}',
            'else if': 'else if condition {}',
            'switch': 'switch value {}',
            'case': 'case pattern: {}',
            'default': 'default: {}',
            'for': 'for item in array {}',
            'while': 'while condition {}',
            'repeat': 'repeat {} while condition',
            'func': 'func functionName(parameters) -> ReturnType {}',
            'return': 'return value',
            'class': 'class ClassName {}',
            'struct': 'struct StructName {}',
            'enum': 'enum EnumName {case value}',
            'init': 'init(parameters) {}',
            'self': 'self',
            'guard': 'guard condition else {}',
            'defer': 'defer {}',
            'map': 'array.map { element in return something }',
            'filter': 'array.filter { element in condition }',
            'reduce': 'array.reduce(initialValue) { result, element in return something }',
            'closure': '{ (parameters) -> ReturnType in statements }',
            'optional': 'let name: String?',
            'nil': 'nil',
            'try': 'try expression',
            'catch': 'catch error {}',
            'do': 'do {} catch {}',
            'throw': 'throw error',
            'protocol': 'protocol ProtocolName {}',
            'extension': 'extension ClassName {}',
            'lazy': 'lazy var variable = value',
            'static': 'static var variable = value',
            'final': 'final class ClassName {}',
            'subscript': 'subscript(index: Int) -> ReturnType {}'
        },

        kotlin: {
            'print': 'print("")',
            'println': 'println("")',
            'val': 'val variable = value',
            'var': 'var variable = value',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'else if': 'else if (condition) {}',
            'when': 'when (expression) { case -> statement }',
            'for': 'for (item in collection) {}',
            'while': 'while (condition) {}',
            'do': 'do {} while (condition)',
            'fun': 'fun functionName(parameters): ReturnType {}',
            'return': 'return value',
            'class': 'class ClassName {}',
            'object': 'object ObjectName {}',
            'interface': 'interface InterfaceName {}',
            'constructor': 'constructor(parameters) {}',
            'init': 'init {}',
            'this': 'this',
            'super': 'super',
            'try': 'try {} catch {}',
            'catch': 'catch (e: Exception) {}',
            'throw': 'throw Exception()',
            'lazy': 'val variable by lazy {}',
            'null': 'null',
            'is': 'if (variable is Type) {}',
            'in': 'if (value in range) {}',
            'fun main': 'fun main(args: Array<String>) {}',
            'String?': 'var str: String?',
            'let': 'variable?.let {}',
            'apply': 'object.apply {}',
            'run': 'object.run {}',
            'with': 'with(object) {}',
            'map': 'list.map { item -> result }',
            'filter': 'list.filter { item -> condition }',
            'reduce': 'list.reduce { acc, item -> result }',
            'return@label': 'return@label value'
        },

        php: {
            'echo': 'echo "";',
            'print': 'print "";',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'elseif': 'elseif (condition) {}',
            'switch': 'switch (expression) {}',
            'case': 'case value: break;',
            'for': 'for ($i = 0; $i < limit; $i++) {}',
            'while': 'while (condition) {}',
            'do': 'do {} while (condition);',
            'function': 'function functionName(parameters) {}',
            'return': 'return value;',
            'array': 'array("value1", "value2")',
            'isset': 'isset($variable)',
            'empty': 'empty($variable)',
            'include': 'include "filename.php";',
            'require': 'require "filename.php";',
            'class': 'class ClassName {}',
            'public': 'public',
            'private': 'private',
            'protected': 'protected',
            'static': 'static',
            'const': 'const NAME = value;',
            'new': 'new ClassName();',
            'this': '$this',
            '->': '$object->property;',
            '::': 'ClassName::method();',
            'die': 'die("message");',
            'exit': 'exit("message");',
            'isset': 'isset($variable)',
            'unset': 'unset($variable)',
            'explode': 'explode("delimiter", $string)',
            'implode': 'implode("delimiter", $array)',
            'json_encode': 'json_encode($array)',
            'json_decode': 'json_decode($json)',
            'strlen': 'strlen($string)',
            'substr': 'substr($string, start, length)',
            'str_replace': 'str_replace("search", "replace", $string)'
        },

        go: {
            'fmt.Println': 'fmt.Println("")',
            'fmt.Printf': 'fmt.Printf("format", value)',
            'var': 'var variable type = value',
            'const': 'const constantName = value',
            'if': 'if condition {}',
            'else': 'else {}',
            'else if': 'else if condition {}',
            'for': 'for i := 0; i < limit; i++ {}',
            'range': 'for index, value := range array {}',
            'switch': 'switch expression {}',
            'case': 'case value: {}',
            'default': 'default: {}',
            'func': 'func functionName(parameters) ReturnType {}',
            'return': 'return value',
            'defer': 'defer functionCall()',
            'go': 'go functionCall()',
            'select': 'select {}',
            'map': 'map[keyType]valueType{}',
            'append': 'append(slice, element)',
            'make': 'make(type, size)',
            'len': 'len(variable)',
            'cap': 'cap(variable)',
            'new': 'new(Type)',
            'delete': 'delete(map, key)',
            'panic': 'panic("message")',
            'recover': 'recover()',
            'go func': 'go func() {}()',
            'channel': 'chan variable = make(chan type)',
            'close': 'close(channel)',
            'nil': 'nil',
            'struct': 'struct { fieldName type }',
            'interface': 'interface { methodName() ReturnType }',
            'type': 'type Name struct {}'
        },
        
        r: {
            'print': 'print(value)',
            'cat': 'cat(value)',
            'if': 'if (condition) {}',
            'else': 'else {}',
            'else if': 'else if (condition) {}',
            'for': 'for (i in vector) {}',
            'while': 'while (condition) {}',
            'repeat': 'repeat {} until (condition)',
            'function': 'function(parameters) {}',
            'return': 'return(value)',
            'vector': 'c(value1, value2)',
            'list': 'list(value1, value2)',
            'matrix': 'matrix(data, nrow, ncol)',
            'data.frame': 'data.frame(column1, column2)',
            'array': 'array(dim = c(dim1, dim2, dim3))',
            'factor': 'factor(vector)',
            'is.na': 'is.na(value)',
            'na.omit': 'na.omit(data)',
            'apply': 'apply(X, MARGIN, FUN)',
            'lapply': 'lapply(X, FUN)',
            'sapply': 'sapply(X, FUN)',
            'tapply': 'tapply(X, INDEX, FUN)',
            'summary': 'summary(object)',
            'mean': 'mean(x)',
            'median': 'median(x)',
            'sd': 'sd(x)',
            'var': 'var(x)',
            'cor': 'cor(x, y)',
            'lm': 'lm(formula, data)',
            'predict': 'predict(model, newdata)',
            'plot': 'plot(x, y)',
            'hist': 'hist(x)',
            'boxplot': 'boxplot(x)',
            'barplot': 'barplot(height)',
            'ggplot': 'ggplot(data, aes()) + geom()'
        }
    }
};
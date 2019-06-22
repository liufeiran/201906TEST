var utils = (function () {
//惰性思想
	var flag = "getComputedStyle" in window;//flag这个变量不销毁，存储的是判断当前的浏览器是否兼容getComputedStyle,true标准浏览器，false是IE6-8
//-----------------------
//[1]listToArray: 实现将类数组转换为数组
	function listToArray(likeAry) {
		if(flag){
			//用数组原型上的slice方法(把likeAry克隆一份一模一样的数组出来)，当slice执行时，让方法中的this变为我要处理的likeAry
			return Array.prototype.slice.call(likeAry, 0);//或者[].slice.call(likeAry, 0);
		}
		//IE6-8不兼容，用循环每一项存入ary的办法
		var ary = [];
		for(var i=0; i<likeAry.length; i++){
			ary[ary.length] = likeAry[i];
		}
		return ary;
	}
	
//[2]formatJSON: 将JSON格式的字符串转换为JSON格式的对象
	function formatJSON(jsonStr){
		//判断JOSN是否是window属性，兼容就用parse方法，不兼容就用eval变为表达式
		return "JOSN" in window ? JSON.parse(jsonStr) : eval("(" + jsonStr + ")");
	}

//[3]offset: 获取当前元素距离body的左偏移和上偏移
	function offset(curEle) {
		//先得到自身的左偏移和上偏移和当前元素的父级参照物
		var disLeft = curEle.offsetLeft,
			disTop = curEle.offsetTop,
			par = curEle.offsetParent;
		while(par) {//父级参照物存在就执行，找到body时par=null不执行
			//如果不是IE8就执行，navigator.userAgent检测浏览器版本的属性
			if(navigator.userAgent.indexOf("MSIE 8.0") === -1) {
				//累加父级参照物的边框
				disLeft += par.clientLeft;
				disTop += par.clientTop;
			}
			//累加父级参照物的偏移量
			disLeft += par.offsetLeft;
			disTop += par.offsetTop;
			//再获取父级参照物，这时就改变了while的par了
			par = par.offsetParent;
		}
		return {left: disLeft, top: disTop};
	}

//[4]win: 获取或者设置浏览器的盒子模型信息[client,offset,scroll]
	function win(attr, value) {//"属性名",值
		//如果没有传value就只是获取
		if(typeof value === "undefined") {
			return document.documentElement[attr] || document.body[attr];
		}
		document.documentElement[attr] = value;
		document.body[attr] = value;
	}
	
//[5]children:获取curEle下所有的元素子节点，如果传递了"tagName",可以在获取的集合中进行二次筛选，把指定的标签名获取到
	function children(curEle, tagName){
		var ary = [];
		//如果浏览器版本是IE678
		if(!flag){
			//获取curEle所有的子节点（元素，文本，注释，文档）
			var nodeList = curEle.childNodes;
			//提高效率的写法，在循环中不用每次都计算nodeList.length
			for(var i=0, len=nodeList.length; i<len; i++){
				//拿出每一个，判断他的nodeType是否为1，（1元素，3文本，8注释，9文档），为1的向ary数组的末尾追加
				var curNode = nodeList[i];
				curNode.nodeType === 1 ? ary[ary.length] = curNode : null;
			}
			nodeList = null;//释放临时变量
		}else{
			//标准浏览器直接用children，但得到的是元素集合（类数组），为了和IE6-8一致，用listToArray方法把类数组转为数组
			ary = this.listToArray(curEle.children);
		}
		//二次筛选,判断传入的标签名是否是string格式
		if(typeof tagName === "string"){
			//此时的ary已经是curEle下所有子标签名的数组了，为了保证递增的k与ary.length长度一致，所以不能用上面那种固定的长度
			for(var k=0; k<ary.length; k++){
				var curEleNode = ary[k];
				//如果拿出的这个元素的标签名的小写和传入标签名的小写不相等
				//console.dir(curEleNode)->属性nodeName和tagName的值一样，用哪个都行，都是获得标签名
				if(curEleNode.nodeName.toLowerCase() !== tagName.toLowerCase()){
					ary.splice(k, 1);//就减去这个标签
					k--;//索引退回，防止数组塌陷
				}
			}
		}
		return ary;
	}

//[6]firstChild:获取第一个元素子节点
	function firstChild(curEle){
		var chs = this.children(curEle);
		return chs.length > 0 ? chs[0] : null;
	}
	
//[7]lastChild:获取最后一个元素子节点
	function lastChild(curEle){
		var chs = this.children(curEle);
		return chs.length > 0 ? chs[chs.length-1] : null;
	}

//[8]prev:获取上一个哥哥元素节点
	function prev(curEle){
		if(flag){
			return curEle.previousElementSibling;//标准直接用属性得到
		}
		var pre = curEle.previousSibling;//先获取上一个哥哥节点
		while (pre && pre.nodeType !== 1){//判断存在和不为元素，
			pre = pre.previousSibling;//再继续找它的上一个哥哥节点
		}
		return pre;
	}
	
//[9]next:获取下一个弟弟元素节点
	function next(curEle){
		if(flag){
			return curEle.nextElementSibling;//标准直接用属性得到
		}
		var nex = curEle.nextSibling;//先获取下一个弟弟节点
		while (nex && nex.nodeType !== 1){//判断存在和不为元素，
			nex = pre.nextSibling;//再继续找它的下一个弟弟节点
		}
		return nex;
	}
	
//[10]prevAll:获取所有的哥哥元素节点
	function prevAll(curEle){
		var ary = [];
		var pre = this.prev(curEle);//用prev方法获取上一个哥哥元素节点（this可有可无，因为都是在utils里,当前匿名空间下）
		while (pre){//只要pre存在（能获取）
			ary.unshift(pre);//为了和原来的顺序一致，存到数组的开头
			pre = this.prev(pre);//再用方法获取它的上一个哥哥元素节点
		}
		return ary;
	}
	
//[11]nextAll:获取所有的弟弟元素节点
	function nextAll(curEle){
		var ary = [];
		var nex = this.next(curEle);//用prev方法获取下一个弟弟元素节点（this可有可无，因为都是在utils里）
		while (nex){//只要pre存在（能获取）
			ary.push(nex);//为了和原来的顺序一致，存到数组的开头
			nex = this.next(nex);//再用方法获取它的下一个弟弟元素节点
		}
		return ary;
	}

//[12]sibling:获取相邻的两个元素节点
	function sibling(curEle){
		var pre = this.prev(curEle);//通过方法获取上一个哥哥元素节点
		var nex = this.next(curEle);//通过方法获取下一个弟弟元素节点
		var ary = [];
		pre ? ary.push(pre) : null;//存在就存
		nex ? ary.push(nex) : null;//存在就存
		return ary;
	}
	
//[13]siblings:获取所有兄弟元素节点
	function siblings(curEle){
		var pre = this.prevAll(curEle);//通过方法获取所有的哥哥元素节点
		var nex = this.nextAll(curEle);//通过方法获取所有的弟弟元素节点
		return pre.concat(nex);//数组拼接
	}
	
//[14]index:获取当前元素索引
	function index(curEle){
		return this.prevAll(curEle).length;//有几个哥哥索引就是几,（个数就是它的索引）有两个哥哥：0、1，length:2，它的索引为2
	}
	
//[15]append:向指定容器末尾追加元素(123456X),container:容器
	function append(newEle, container){
		container.appendChild(newEle);
	}
	
//[16]prepend:向指定容器开头追加元素(X123456)
	function prepend(newEle, container){
		var fir = this.firstChild(container);//获取第一个元素子节点
		if(fir){
			container.insertBefore(newEle, fir);//添加到它的前面
			return;
		}
		container.appendChild(newEle);//如果一个元素都没有，增加在开头和末尾都一样
	}
	
//[17]insertBefore:把新元素(newEle)追加到指定元素(oldEle)的前面，内置的就有这个方法(1X23456)
	function insertBefore(newEle, oldEle){
		oldEle.parentNode.insertBefore(newEle, oldEle);//老元素的父级节点有insertBefore方法
	}
	
//[18]insertAfter:把新元素(newEle)追加到指定元素(oldEle)的后面，相当于追加到oldEle弟弟元素的前面(12345X6)
	function insertAfter(newEle, oldEle){
		var nex = this.next(oldEle);//获取到指定元素的弟弟元素节点
		if(nex){
			oldEle.parentNode.insertBefore(newEle, nex);用insertBefore方法添加到它的弟弟元素的前面
			return;
		}
		oldEle.parentNode.appendChild(newEle);//如果弟弟元素不存在，也就是当前元素已经是最后一个了，把新元素放在最末尾即可
	}
	
//[19]hasClass:验证当前元素中是否包含className这个样式类名
	function hasClass(curEle, className) {
		//用实例的方式创建，可以使用字符串拼接的方式添加传入的变量进来
		//(^| +)和( +|$)判断传入的样式名是在开头或末尾或中间（多个空格）都可以
		var reg = new RegExp("(^| +)" + className + "( +|$)");
		//curEle.className:获取这个元素的所有样式类名，拿到原有的所有样式类名与正则匹配，匹配到返回true
		return reg.test(curEle.className);
	}

//[20]addClass:给元素增加样式类名
	function addClass(curEle, className) {
		//className传入多个样式类名，把传递进来的字符串按照一到多个空格拆分成数组中的每一项
		var ary = className.replace(/^ +| +$/g,"").split(/ +/g);
		//循环数组，一项项的进行验证增加即可
		for(var i = 0, len = ary.length; i < len; i++) {
			var curName = ary[i];
			//判断传入的样式类名原先是否存在，不存在（取反）才增加
			if(!this.hasClass(curEle, curName)) {
				curEle.className += " " + curName; //样式类名直接用空格分隔
			}
		}
	}

//[21]removeClass:给元素移除样式类名
	function removeClass(curEle, className) {
		//className传入多个样式类名，把传递进来的字符串按照一到多个空格拆分成数组中的每一项
		var ary = className.replace(/^ +| +$/g,"").split(/ +/g);
		//循环数组，一项项的进行验证增加即可
		for(var i = 0, len = ary.length; i < len; i++) {
			var curName = ary[i];
			//存在才移除
			if(this.hasClass(curEle, curName)) {
				var reg = new RegExp("(^| +)" + curName + "( +|$)", "g"); //用正则匹配，全局
				curEle.className = curEle.className.replace(reg, " "); //把匹配到的用空格替换
			}
		}
	}
	
//[22]getElementsByClass:通过元素的样式类名获取一组元素集合
	//只处理传递一个样式类名的（但是首尾可能会加很多的空格）
	//strClass:传递进来的样式类名，context：限定获取的范围（上下文）,不传递默认赋值为document
	//思路：获取指定上下文中所有的标签，然后遍历这些标签，把所有class中，包含传递进来的样式类的元素，都保存起来
	function getElementsByClass(strClass, context) {
		context = context || document; //context传了就用它，没传就是document
		if(flag) {//标准浏览器直接用方法就行，但结果要变为数组
			return this.listToArray(context.getElementsByClassName(strClass));
		}
		//IE6-8
		var result = [],
			nodeList = context.getElementsByTagName('*'); //获取context中所有的元素标签名
		//不仅去除传递进来样式类的首尾空格，还要把传递的多个样式类名拆分成一个数组（数组中包含传递的每一个样式类名）
		strClass = strClass.replace(/^\s+|\s+$/g, '').split(/\s+/g);
		//假设法：验证假设的值是真是假，循环传递的所有样式类名，拿strClass的每一项看在itemClass中存不存在，只要有一个不在标签中，假设的就是错误的
		for(var i = 0; i < nodeList.length; i++) { //循环获得的所有标签名
			var item = nodeList[i]; //当前循环的标签名item
			var itemClass = item.className; //当前循环的item的样式类名
			var isOk = true; //假设传递的样式类名在item中都存在
			for(var k = 0; k < strClass.length; k++) { //循环传递的所有样式类名
				var reg = new RegExp('(^| +)' + strClass[k] + '( +|$)'); //当前传入的某一个样式类名(数组中的某一项)：strClass[k]，验证item.className字符串中是否包含传递进来的strClass样式类
				if(!reg.test(itemClass)) {
					//如果存在true，取反false，不执行里面的代码，直接到下面的代码里存入数组里，
					//如果不存在false，取反true，执行里面的代码让假设的为false，就不往数组里存
					isOk = false;
					break; //不用再往后比较了，跳出循环进行下一个strClass[k]
				}
			}
			isOk ? result.push(item) : null; //如果isOk为true就存到数组的末尾
		}
		return result;
	}
	
//[23]getCss: 获取所有经过浏览器计算过的样式值
	function getCss(attr){//只传入"属性名"
	//this:在myCss方法执行时传入的元素标签
		var val = null, reg = null;
		//判断window下是否有这个属性
		if(flag) {
			val = window.getComputedStyle(this, null)[attr];//伪类：null
		} else {
			//IE用currentStyle方法获取
			if(attr === "opacity") {//如果是透明度值获取
				val = this.currentStyle["filter"];
				reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;//获取数字正则
				val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;//如果匹配获取第一个小分组再除以100
			} else {
				val = this.currentStyle[attr];
			}
		}
		reg = /^(-?\d+(\.\d+)?)(px|pt|rem|em)?$/i;//正则：正负数0-9出现一到多位，小数可有可无，单位可有可无
		return reg.test(val) ? parseFloat(val) : val;//如果匹配只获取有效数字，不要单位
	}
	
//[24]setCss: 给当前元素某个样式属性设置值（增加在行内样式）
	function setCss(attr, value) {
	//this:在myCss方法执行时传入的元素标签
		//判断float兼容处理
		if(attr === "float") {
			this.style["cssFloat"] = value;
			this.style["styleFloat"] = value;
			return;
		}
		//判断透明度兼容处理
		if(attr === "opacity") {
			this.style["opacity"] = value;
			this.style["filter"] = "alpha(opacity=" + value * 100 + ")";
			return;
		}
		//符合正则可以自动加单位px
		var reg = /^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
		if(reg.test(attr)) {//当样式名与正则匹配
			if(!isNaN(value)) {//如果传入的值为有效数字
				value += "px";//就让值加上单位
			}
		}
		this.style[attr] = value;//将完成的值赋值给样式
	}
	
//[25]setGroupCss：批量给当前元素设置样式属性值（行内），这个方法在myCss中已经判断为对象才执行
	function setGroupCss(options){
	//this:在myCss方法执行时传入的元素标签
		//遍历对象所有键值对
		for(var key in options){
			if(options.hasOwnProperty(key)){//只遍历私有的，不需要遍历它所属类原型上的(公有的)
				setCss.call(this, key, options[key]);//将遍历的每一个键值对都执行setCss方法（元素名，属性名，属性值）
			}
		}
	}
	
//[26]myCss:实现获取，单独设置，批量设置元素的样式值
	function myCss(curEle){
		var argTwo = arguments[1],//获得第二个参数
			ary = Array.prototype.slice.call(arguments, 1);//去除第一个元素标签，后面传入的都转到一个数组中
		if(typeof argTwo === "string"){//第二个参数值是字符串=>获取
			if(typeof arguments[2] === "undefined"){//判断第三个参数传没传，不能用!arguments[2],因为值为!0结果是true就说明我传了也认成没传
				return getCss.apply(curEle, ary);//方法执行时让方法中的this变为curEle（传入的元素），apply：可以以数组的形式传入参数，ary有几个参数都传进去，因为判断第三个不存在，所以只有一个
				//等同于return this.getCss(curEle, argTwo);
			}
			setCss.apply(curEle, ary);//方法执行时让方法中的this变为curEle（传入的元素），apply：可以以数组的形式传入参数，这时说明第三个参数存在，就是设置
			//等同于this.setCss(curEle, argTwo, argThree);
		}
		argTwo = argTwo || 0;
		if(argTwo.toString() === "[object Object]"){
			//批量设置样式属性值
			setGroupCss.apply(curEle, ary);//方法执行时让方法中的this变为curEle（传入的元素），apply：可以以数组的形式传入参数
		}
	}
	
//-----------------------	
	return {
		listToArray: listToArray,
		formatJSON: formatJSON,
		offset: offset,
		win: win,
		children: children,
		firstChild: firstChild,
		lastChild: lastChild,
		prev: prev,
		next: next,
		prevAll: prevAll,
		nextAll: nextAll,
		sibling: sibling,
		siblings: siblings,
		index: index,
		append: append,
		prepend: prepend,
		insertBefore: insertBefore,
		insertAfter: insertAfter,
		hasClass:hasClass,
		addClass:addClass,
		removeClass:removeClass,
		getElementsByClass:getElementsByClass,
		myCss: myCss
	}
})();
















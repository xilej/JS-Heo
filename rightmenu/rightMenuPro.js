// 初始化函数
let rm = {};

//禁止图片拖拽
rm.stopdragimg=$("img");
rm.stopdragimg.on("dragstart",function(){return false;});

// 显示菜单
rm.showRightMenu = function(isTrue, x=0, y=0){
    let $rightMenu = $('#rightMenu');
    $rightMenu.css('top',x+'px').css('left',y+'px');
    if(isTrue){
        $rightMenu.show();
        stopMaskScroll()
    }else{
        $rightMenu.hide();
    }
}

// 隐藏菜单
rm.hideRightMenu = function(){
  rm.showRightMenu(false);
  $('#rightmenu-mask').attr('style','display: none');
}

// 尺寸
let rmWidth = $('#rightMenu').width();
let rmHeight = $('#rightMenu').height();

// 重新定义尺寸
rm.reloadrmSize = function(){
  rmWidth = $('#rightMenu').width();
  rmHeight = $('#rightMenu').height();
}

// 获取点击的href
let domhref = '';
let domImgSrc = '';

// 监听右键初始化
window.oncontextmenu = function(event){
  if(document.body.clientWidth > 768){
    let pageX = event.clientX + 10;	//加10是为了防止显示时鼠标遮在菜单上
    let pageY = event.clientY;

    //其他额外菜单
    let $rightMenuOther = $('.rightMenuOther');
    let $rightMenuPlugin = $('.rightMenuPlugin');
    let $rightMenuCopyText = $('#menu-copytext');
    let $rightMenuCommentText = $('#menu-commenttext');
    let $rightMenuNewWindow = $('#menu-newwindow');
    let $rightMenuCopyLink = $('#menu-copylink');
    let $rightMenuCopyImg = $('#menu-copyimg');
    let $rightMenuDownloadImg = $('#menu-downloadimg');
    let $rightMenuSearch = $('#menu-search');
    let $rightMenuSearchBaidu = $('#menu-searchBaidu');
    let href = event.target.href;
    let imgsrc = event.target.currentSrc;

    // 判断模式 扩展模式为有事件
    let pluginMode = false;
    $rightMenuOther.show();

    // 检查是否需要复制 是否有选中文本
    if(selectTextNow && window.getSelection()){
      pluginMode = true;
      $rightMenuCopyText.show();
      $rightMenuCommentText.show();
      $rightMenuSearch.show();
      $rightMenuSearchBaidu.show();
      $rightMenuOther.hide();
    }else{
      $rightMenuCopyText.hide();
      $rightMenuCommentText.hide();
      $rightMenuSearchBaidu.hide();
      $rightMenuSearch.hide();
    }

    //检查是否右键点击了链接a标签
    if(href){
      pluginMode = true;
      $rightMenuNewWindow.show();
      $rightMenuCopyLink.show();
      $rightMenuOther.hide();
      domhref = href;
    }else{
      $rightMenuNewWindow.hide();
      $rightMenuCopyLink.hide();
    }

    //检查是否需要复制图片
    if(imgsrc){
      pluginMode = true;
      $rightMenuCopyImg.show();
      $rightMenuDownloadImg.show();
      $rightMenuOther.hide();
      domImgSrc = imgsrc;
    }else{
      $rightMenuCopyImg.hide();
      $rightMenuDownloadImg.hide();
    }

    // 如果不是扩展模式则隐藏扩展模块
    if (pluginMode){
      $rightMenuPlugin.show()
    }else{
      $rightMenuPlugin.hide()
    }

    rm.reloadrmSize()

     // 鼠标默认显示在鼠标右下方，当鼠标靠右或考下时，将菜单显示在鼠标左方\上方
    if(pageX + rmWidth > window.innerWidth){
      pageX -= rmWidth+10;
    }
    if(pageY + rmHeight > window.innerHeight){
        pageY -= pageY + rmHeight - window.innerHeight;
    }
    
    rm.showRightMenu(true, pageY, pageX);
    $('#rightmenu-mask').attr('style','display: flex');
    return false;
  }
};

// 下载图片
rm.downloadimging = false;
function downloadImage(imgsrc, name) {//下载图片地址和图片名
  rm.hideRightMenu();
  if (rm.downloadimging == false) {
    rm.downloadimging = true;
    btf.snackbarShow('正在下载中，请稍后',false,10000)
    setTimeout(function(){
      let image = new Image();
      // 解决跨域 Canvas 污染问题
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
        let a = document.createElement("a"); // 生成一个a元素
        let event = new MouseEvent("click"); // 创建一个单击事件
        a.download = name || "photo"; // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
      };
      image.src = imgsrc;
      btf.snackbarShow('图片已添加盲水印，请遵守版权协议');
      rm.downloadimging = false;
    }, "10000");
  }else{
    btf.snackbarShow('有正在进行中的下载，请稍后再试');
  }
}

// 复制图片到剪贴板
rm.writeClipImg = function (imgsrc) {
  console.log('按下复制');
  rm.hideRightMenu();
  btf.snackbarShow('正在下载中，请稍后',false,10000)
  if(rm.downloadimging == false){
    rm.downloadimging = true;
    setTimeout(function(){
      copyImage(imgsrc);
      btf.snackbarShow('复制成功！图片已添加盲水印，请遵守版权协议');
      rm.downloadimging = false;
    },"10000")
  }
}

function imageToBlob(imageURL) {
  const img = new Image;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  img.crossOrigin = "";
  img.src = imageURL;
  return new Promise(resolve => {
    img.onload = function () {
      c.width = this.naturalWidth;
      c.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      c.toBlob((blob) => {
        // here the image is a blob
        resolve(blob)
      }, "image/png", 0.75);
    };
  })
}

async function copyImage(imageURL){
  const blob = await imageToBlob(imageURL)
  const item = new ClipboardItem({ "image/png": blob });
  navigator.clipboard.write([item]);
}

rm.switchDarkMode = function() {
  navFn.switchDarkMode();
  rm.hideRightMenu();
}

rm.copyUrl = function(id) {
    $("body").after("<input id='copyVal'></input>");
    var text = id;
    var input = document.getElementById("copyVal");
    input.value = text;
    input.select();
    input.setSelectionRange(0, input.value.length);   
    document.execCommand("copy");
    $("#copyVal").remove();
}

function stopMaskScroll(){
  if (document.getElementById("rightmenu-mask")){
    let xscroll = document.getElementById("rightmenu-mask");
  xscroll.addEventListener("mousewheel", function (e) {
    //阻止浏览器默认方法
    rm.hideRightMenu();
    // e.preventDefault();
   }, false);
  }
  if (document.getElementById("rightMenu")){
    let xscroll = document.getElementById("rightMenu");
  xscroll.addEventListener("mousewheel", function (e) {
    //阻止浏览器默认方法
    rm.hideRightMenu();
    // e.preventDefault();
    }, false);
  }
}

rm.rightmenuCopyText = function(txt){
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt);
  }
  rm.hideRightMenu();
}

rm.copyPageUrl = function(){
  var url = window.location.href;
  rm.copyUrl(url);
  btf.snackbarShow('复制本页链接地址成功',false,2000);
  rm.hideRightMenu();
}

// 复制当前选中文本
var selectTextNow = '';
document.onmouseup = document.ondbclick= selceText;
function selceText(){
    var txt;
    if(document.selection){
        txt = document.selection.createRange().text;
    }else{
        txt = window.getSelection()+'';
    }
    if(txt){
      selectTextNow = txt;
      // console.log(selectTextNow);
    }else{
      selectTextNow = '';
    }
}

//引用到评论
rm.rightMenuCommentText = function(txt){
  rm.hideRightMenu();
  var input = document.getElementsByClassName('el-textarea__inner')[0];
  let evt = document.createEvent('HTMLEvents');
  evt.initEvent('input', true, true);
  let inputValue = replaceAll(txt,'\n','\n> ')
  input.value = '> ' + inputValue + '\n\n';
  input.dispatchEvent(evt);
  var domTop = document.querySelector("#post-comment").offsetTop;
  window.scrollTo(0,domTop - 80);
  input.focus();
  input.setSelectionRange(-1,-1);
}

//替换所有内容
function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

// 百度搜索
rm.searchBaidu = function(){
  btf.snackbarShow('即将跳转到百度搜索',false,2000);
  setTimeout(function(){
    window.open('https://www.baidu.com/s?wd=' + selectTextNow);
  }, "2000");
  rm.hideRightMenu();
}

function addRightMenuClickEvent(){
  // 添加点击事件
  $('#menu-backward').on('click',function(){window.history.back();rm.hideRightMenu();});
  $('#menu-forward').on('click',function(){window.history.forward();rm.hideRightMenu();});
  $('#menu-refresh').on('click',function(){window.location.reload();});
  $('#menu-top').on('click',function(){btf.scrollToDest(0, 500);rm.hideRightMenu();});
  $('.menu-link').on('click',rm.hideRightMenu);
  $('#menu-darkmode').on('click',rm.switchDarkMode);
  $('#menu-home').on('click',function(){window.location.href = window.location.origin;});
  $('#rightmenu-mask').on('click',rm.hideRightMenu);
  $('#rightmenu-mask').contextmenu(function(){
    rm.hideRightMenu();
    return false;
  });
  $('#menu-translate').on('click',function(){
      rm.hideRightMenu();
      translateInitialization();
  });
  $('#menu-copy').on('click', rm.copyPageUrl);
  $('#menu-copytext').on('click',function(){rm.rightmenuCopyText(selectTextNow);btf.snackbarShow('复制成功，复制和转载请标注本文地址');});
  $('#menu-commenttext').on('click',function(){rm.rightMenuCommentText(selectTextNow);});
  $('#menu-newwindow').on('click',function(){window.open(domhref);rm.hideRightMenu();});
  $('#menu-copylink').on('click',function(){rm.rightmenuCopyText(domhref);btf.snackbarShow('已复制链接地址');});
  $('#menu-downloadimg').on('click',function(){downloadImage(domImgSrc,'zhheo');});
  $('#menu-copyimg').on('click',function(){rm.writeClipImg(domImgSrc);});
  $('#menu-searchBaidu').on('click',rm.searchBaidu);
}

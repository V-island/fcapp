//禁止浏览器后退
window.history.forward(1);


// 第一种
pushHistory();

function pushHistory() {
    var state = {
        title: "title",
        url: "__MODULE__/Index/index"
    };
    window.history.pushState(state, "title", "__MODULE__/Index/index");
}
window.addEventListener("popstate", function(e) {
    $('.order').show();
    $('.mask222').hide();
    $("#vehicle_Select_List").css('display', 'none');
}, false);



// 第二种
pushHistory();
window.addEventListener("popstate", function(e) {
    $('.order2').show();
    $("#userSelectMap").animate({
        left: "100%",
    }, 100);

    $("#nearDiv").animate({
        left: "100%",
    }, 100);
    // $("#userSelectMap").hide();
    // return false;
    // $(window).unbind('scroll');
    window.location.href = "indexNext.html"
}, false);

function pushHistory() {
    var state = {
        title: "title",
        url: "#"
    };
    window.history.pushState(state, "title", "#");
}
document.addEventListener("WeixinJSBridgeReady", function() {
    WeixinJSBridge.call("showToolbar")
});



// 防止页面后退//阻止安卓机后退
// 页面载入时使用pushState插入一条历史记录
history.pushState(null, null, '#');
console.log('刷新');
window.addEventListener('popstate', function(event) {
    console.log('回退');
    // 点击回退时再向历史记录插入一条，以便阻止下一次点击回退
    history.pushState(null, null, '#');
});
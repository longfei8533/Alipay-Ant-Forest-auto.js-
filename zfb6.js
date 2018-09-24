
//默认分辨率为1280*720
//获取手机分辨率
"auto";
var _width = device.width
var _height = device.height
var zoomX = _width / 720
var zoomY = _height / 1280

//判断电量是否充足
function power() {
    if (device.isCharging()) {
        return true
    } else {
        if (device.getBattery() > 20) {
            return true
        } else {
            toastLog("电量不足")
            return false
        }
    }
}
//判断时间是否合适
function time() {
    var da = new Date();
    var minutes = da.getMinutes();
    var hours = da.getHours();
    var time_ = hours * 60 + minutes - 420;
    if (time_ >= 0 && time_ <= 30) {
        return true
    } else {
        return false
    }
}

//判断是否亮屏，并解锁(模拟上划进入图案解锁界面，模拟滑动画出图案解锁)
function unlock() {
    if (!device.isScreenOn()) {
        device.wakeUp();
        sleep(500);
        swipe(_width*0.5, _height*0.8, _width*0.5, _height*0.2, 200);
        sleep(500);
        gesture(2000, [190*zoomX, 735*zoomY], [190*zoomX, 905*zoomY], [530*zoomX, 905*zoomY], [530*zoomX, 1075*zoomY]);
        sleep(2000);
    }
}
//创建多线程对象，按键监听，按下返回键结束脚本
function over() {
    threads.start(function() {
        events.observeKey();
        events.on("back", function(events) {
            toast("退出收集");
            exit();
        });
    });
}
//错误
function error(){
    //device.vibrate(500);
    toastLog("错误");
    backHomePage();
    main()
    exit();}

//返回支付宝首页
function backHomePage() {
    launchApp("支付宝");
    sleep(1000);
    while (!className("android.widget.TextView").text("首页").exists()) {
        back();
        sleep(1000);
    };
    var bhp = className("android.widget.TextView").text("首页").findOne().bounds()
    click(bhp.centerX(), bhp.centerY());
    click(bhp.centerX(), bhp.centerY());
    sleep(500);
}

//进入蚂蚁森林
function enterForest() {
    textEndsWith("蚂蚁森林").findOne(10000);
    if (!textEndsWith("蚂蚁森林").exists()) {
        error();
    }
    click("蚂蚁森林");
    descContains("合种").findOne(20000);
    if (!descContains("合种").exists()) {
        error();
    }
    sleep(2000);
}

//收集自己能量
function myEnergy() {
    while (descStartsWith("收集能量").exists()) {
        var p = descStartsWith("收集能量").findOne().bounds();
        click(p.centerX(), p.centerY());
        sleep(1000);
        click(p.centerX(), p.centerY());
    };
}


//点击能量球
function clickBall() {
    while (descContains("可收取").exists()) {
        var b = descContains("可收取").findOne().bounds();
        click(b.centerX(), b.centerY() - 70 * zoomY);
        sleep(500);
    };
}

//进入排行榜
function enterRank() {
    while (true) {
        if (descContains("查看更多好友").exists()) {
            var rank = descContains("查看更多好友").findOne().bounds();
            if (rank.centerY() < _height) {
                click(rank.centerX(), rank.centerY());
                break;
            } else {
               scrollDown();
               sleep(1000);
            }
        } else(error())
    }
}

//判断可收取的好友返回y坐标
function rectY() {
    var img = captureScreen();
    sleep(500);
    var y = 0;
    var x = 703 * zoomX;
    while (y < 1236 * zoomY) {
        var r1 = images.detectsColor(img, "#30BF6C", x, y);
        var r2 = images.detectsColor(img, "#FFFFFF", x, y + 22 * zoomY);
        var r3 = images.detectsColor(img, "#30BF6C", x, y + 36 * zoomY);
        if (r1 && r2 && r3) {
            return y;
            break;
        }
        y += zoomY;
    }
    return null;
}


//判断可收集能量好友并收取
function getEnergy() {
    while (true) {
        var p = rectY();
        if (p == null) {
            break;
        } else {
            click(_width * 0.5, p + 60 * zoomY);
            descContains("浇水").findOne();
            sleep(500);
            clickBall();
            sleep(1000);
            back();
            sleep(1000);
        }
    }
}


//判断好友榜是否结束
function isRankEnd() {
    if (descContains("没有更多了").exists()) {
        var b = descContains("没有更多了").findOne().bounds()
        if (b.centerY() < 1280 * zoomY) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

//收集
function collect() {
    while (!isRankEnd()) {
        textContains("好友排行榜").findOne(10000);
        if (textContains("好友排行榜").exists()) {
            getEnergy();
            scrollDown();
            sleep(500);
        } else {
            error();
        }
    }
};

//循环执行
function main() {
    var n = 0
    while (power()) {
        launchApp("支付宝");
        enterForest();
        myEnergy();
        enterRank();
        collect();
        n += 1;
        toastLog("收集完成" + n);
        backHomePage();
        if (time() && power()) {
            continue;
        } else {
            exit();
        }
    }

}

unlock();
auto.waitFor();
requestScreenCapture();
over();
toast("启动支付宝");
main();
var express = require('express');
var router = express.Router();



const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

const { chromium } = require('playwright');  // 或者使用 'firefox' 或 'webkit'

let page;

let setPlaywright = async () => {
    // 启动浏览器
    const browser = await chromium.launch();

    // 创建一个新的浏览器上下文
    const context = await browser.newContext();

    // 创建一个新页面
    page = await context.newPage();
}

setPlaywright()

let saveImage = async (name, url) => {


    // 导航到目标网址
    console.log(url);

    await page.goto(url);


    const now = new Date().getTime();
    // 截图并保存
    await page.screenshot({ path: `${path.join(__dirname, '../public/images')}/screenshot-${name}-${now}.png` });  // 可以指定其他路径和文件名

    // 关闭浏览器
    // await browser.close();
}


/* GET home page. */
router.post('/add', async function (req, res, next) {

    // 解析参数
    let { name, url } = req.body;

    console.log(name, "-----", url);


    url = `https://${url}`

    // playwright
    try {
        await saveImage(name, url)
    } catch (error) {
        console.log(error.message);
        // 优化
        res.send("Add No");

        return
    }



    res.send("Add OK");
});

router.get('/get', async function (req, res, next) {

    const folderPath = path.join(__dirname, '../public/images'); // 替换为您要打包的文件夹路径

    const zipFileName = 'images.zip'; // 压缩包名称

    // 设置响应头
    res.attachment(zipFileName);

    // 创建压缩流
    const archive = archiver('zip', {
        zlib: { level: 5 } // 设置压缩级别
    });

    // 处理压缩流错误
    archive.on('error', (err) => {
        throw err;
    });

    // 将压缩流连接到响应对象
    archive.pipe(res);

    // 将文件夹中的所有文件添加到压缩包中
    archive.directory(folderPath, false); // false 代表不保留文件夹结构

    // 完成压缩
    archive.finalize();


});

router.get('/start', async function (req, res, next) {

    const folderPath = path.join(__dirname, '../public/images');

    // recursive: true: 递归删除目录及其内容。
    // force: true: 强制删除，即使目录中有只读文件。
    // 或者同步删除

    try {
        fs.rmSync(folderPath, { recursive: true, force: true });
    } catch (error) {
        res.send("delete NO");
        return
    }

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log('Folder created successfully!');
    } 
    res.send("delete OK");
});

module.exports = router;




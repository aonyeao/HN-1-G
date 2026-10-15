# Seebird website

纯静态网站，可直接部署到 GitHub Pages，无需安装依赖或运行构建。

- index.html：默认首页，窄屏自动进入 mobile.html，宽屏直接显示电脑端。
- desktop.html：电脑端独立入口。
- mobile.html：手机端独立入口。
- site.css、refinement.css、site.js、assets/：必须与入口一起上传，保留目录层级和大小写。

## 双端体验

字体使用设备系统字体，苹果设备优先苹方与系统字体，Windows 回退至微软雅黑；无需下载外部字体。手机正文16px，桌面正文16–17px，标题随屏宽自适应。

支持轻缓入场、滚动导航、原生语义详情展开、键盘及触摸图片浏览。遵循设备“减少动态效果”设置，不接管页面滚动。材质展示为静态图片，无视频素材。

## GitHub Pages 部署

1. 将部署包解压后的所有文件上传到仓库根目录，确保根目录直接有 index.html，而不是多套一层文件夹。
2. 仓库 Settings → Pages → Build and deployment → Source 选择 Deploy from a branch。
3. Branch 选择文件所在分支（通常 main），Folder 选择 / (root)，然后 Save。
4. 等待 Pages 部署工作流成功，打开 Pages 页面给出的站点地址。普通项目地址通常是 https://用户名.github.io/仓库名/。

如果选择从 /docs 发布，必须将整套文件放在 docs 目录，不能只放 HTML。不要使用 GitHub 仓库的文件预览地址代替 Pages 站点地址。

所有资源均使用相对路径，可兼容项目仓库子路径。中文正文不受英文文件名影响。

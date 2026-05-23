# Judy's Space

一个 Vite + React 应用，生产环境由 Node/Express 托管静态页面并提供 `/api/state` 接口。数据保存在服务器 Docker volume 中的 `/data/state.json`，不同手机和浏览器访问同一个 VPS 地址会共享同一份数据。

浏览器本地 IndexedDB/localForage 只作为后端不可用时的兜底缓存；首次部署新版本后，会尝试把当前浏览器已有的本地数据迁移到服务器。

## 本地运行

前置要求：Node.js 20+。

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## Docker 本地验证

```bash
docker compose up -d --build
```

打开：

```text
http://localhost:8090
```

停止：

```bash
docker compose down
```

查看服务器端数据卷：

```bash
docker volume inspect judy-space_judy-space-data
```

## 部署到 VPS

以下命令假设 VPS 是 Ubuntu 22.04/24.04，并且你已经把项目上传到服务器的 `/opt/judy-space`。

1. 安装 Docker 和 Compose 插件：

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

2. 上传项目到 VPS：

```bash
rsync -av --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  ./ root@你的服务器IP:/opt/judy-space/
```

这条命令需要在项目根目录执行；也可以用 Git 拉代码。

3. 在 VPS 上启动：

```bash
cd /opt/judy-space
docker compose up -d --build
docker compose ps
```

4. 放行端口：

```bash
sudo ufw allow 8090/tcp
```

访问：

```text
http://你的服务器IP:8090
```

## 绑定域名和 HTTPS

天气卡片会请求浏览器定位权限。浏览器通常只允许 HTTPS 或 localhost 使用定位能力，所以正式访问建议给域名配置 HTTPS。

一种简单做法是在 VPS 上用 Caddy 反向代理：

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

编辑 `/etc/caddy/Caddyfile`：

```caddyfile
your-domain.com {
  reverse_proxy 127.0.0.1:8090
}
```

然后：

```bash
sudo systemctl reload caddy
```

域名 DNS 的 A 记录需要指向你的 VPS IP。

## 更新部署

每次代码更新后，在 VPS 项目目录执行：

```bash
git pull
docker compose up -d --build
```

正常更新不要删除 Docker volume，否则服务器上保存的纪念日、清单、经期记录和照片会丢失。

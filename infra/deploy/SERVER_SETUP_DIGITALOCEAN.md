# Thiết lập server triển khai (DigitalOcean Droplet)

Hướng dẫn cho **một Droplet Ubuntu 22.04 LTS** (hoặc tương đương). AWS EC2 tương tự: thay bước tạo máy bằng launch instance + security group mở 22, 80, 4000 nếu cần.

## 1. Tạo Droplet

- **Image:** Ubuntu 22.04 LTS  
- **Kích thước:** tối thiểu 1 vCPU / 1GB RAM (hackathon); production nên 2GB+  
- **SSH keys:** thêm public key của bạn (đăng nhập không mật khẩu)  
- **Firewall (DigitalOcean Cloud Firewall hoặc ufw):** cho phép **22** (SSH), **80** (HTTP frontend), tùy chọn **4000** (API trực tiếp) hoặc chỉ expose qua reverse proxy sau này  

## 2. Cài Docker Engine + Compose

SSH vào Droplet:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Đăng xuất / đăng nhập lại để nhóm `docker` có hiệu lực, hoặc dùng `newgrp docker`.

## 3. Thư mục triển khai

```bash
sudo mkdir -p /opt/ikp
sudo chown "$USER":"$USER" /opt/ikp
```

Copy từ repo (hoặc tải artifact) các file:

- `infra/deploy/docker-compose.prod.yml` → `/opt/ikp/docker-compose.prod.yml`  
- Tạo `/opt/ikp/.env` từ `infra/deploy/.env.example` và điền mật khẩu / `DATABASE_URL` thật  

## 4. Biến môi trường trên server

| Biến | Ý nghĩa |
|------|---------|
| `POSTGRES_USER` / `POSTGRES_DB` | User và tên DB Postgres trong compose |
| `POSTGRES_PASSWORD` | Mật khẩu DB (bắt buộc đổi production) |
| `DATABASE_URL` | Chuỗi Prisma/Backend, host phải là `postgres` (tên service) |

**Lưu ý Next.js:** `NEXT_PUBLIC_*` được nhúng lúc **build** image. Trong GitLab CI, đặt biến `NEXT_PUBLIC_API_URL` (protected, optional) trỏ tới URL công khai của API (ví dụ `https://api.domain.com`) khi build job `docker_frontend`.

## 5. Khóa SSH cho GitLab CI

1. Trên server **không** cần private key của GitLab; runner SSH **vào** server.  
2. Tạo user deploy (khuyến nghị):

   ```bash
   sudo adduser --disabled-password --gecos "" deploy
   sudo usermod -aG docker deploy
   sudo mkdir -p /home/deploy/.ssh
   # Dán public key (cặp với private key lưu trong GitLab CI variable DEPLOY_SSH_PRIVATE_KEY)
   sudo nano /home/deploy/.ssh/authorized_keys
   sudo chown -R deploy:deploy /home/deploy/.ssh
   sudo chmod 700 /home/deploy/.ssh
   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   ```

3. Cấp quyền `deploy` đọc/ghi `/opt/ikp` (hoặc đặt compose trong home):

   ```bash
   sudo chown -R deploy:deploy /opt/ikp
   ```

## 6. GitLab CI/CD Variables (Settings → CI/CD → Variables)

| Variable | Kiểu | Ghi chú |
|----------|------|---------|
| `DEPLOY_SSH_PRIVATE_KEY` | File / Variable | Private key PEM (không có passphrase khuyến nghị cho CI) |
| `DEPLOY_HOST` | Variable | IP hoặc FQDN Droplet |
| `DEPLOY_USER` | Variable | Ví dụ `deploy` |
| `NEXT_PUBLIC_API_URL` | Variable (optional) | URL API cho build frontend production |

Biến đăng nhập registry (`CI_REGISTRY_*`) GitLab cung cấp sẵn trên pipeline; script deploy dùng để `docker login` trên server.

## 7. Kiểm tra thủ công (lần đầu)

Trên máy có quyền pull image (sau khi `docker login`):

```bash
export CI_REGISTRY=registry.gitlab.com
export CI_REGISTRY_IMAGE=registry.gitlab.com/<group>/<project>
export CI_COMMIT_SHORT_SHA=<tag>
export CI_REGISTRY_USER=<gitlab-registry-user>
export CI_REGISTRY_PASSWORD=<token>
export BACKEND_IMAGE="$CI_REGISTRY_IMAGE/backend"
export FRONTEND_IMAGE="$CI_REGISTRY_IMAGE/frontend"
export IMAGE_TAG="$CI_COMMIT_SHORT_SHA"
cd /opt/ikp
docker compose --env-file .env -f docker-compose.prod.yml pull
docker compose --env-file .env -f docker-compose.prod.yml up -d
```

Frontend: `http://<IP-DROPLET>/` — Backend: `http://<IP-DROPLET>:4000/health` (nếu mở port 4000).

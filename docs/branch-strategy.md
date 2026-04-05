# Chiến lược nhánh Git (GitLab CI/CD)

## Quy tắc triển khai (bắt buộc)

| Nhánh | CI (build / test / docker build) | Deploy lên server |
|-------|----------------------------------|-------------------|
| `main` | Có | Có |
| `production` | Có | Có |
| `develop` | Có | **Không** |
| `feature/*`, `fix/*`, nhánh khác | Có | **Không** |

Chỉ `main` hoặc `production` được chạy job **deploy** trong `.gitlab-ci.yml`.

## Quy ước đặt tên nhánh

- `main` — nhánh phát hành chính (khuyến nghị mặc định).
- `production` — nhánh mirror hoặc release ổn định (nếu team dùng song song với `main`).
- `develop` — tích hợp liên tục; chỉ build/test, không deploy tự động.
- `feature/<mô-tả-ngắn>` — tính năng mới (ví dụ `feature/article-editor`).
- `fix/<mô-tả>` — sửa lỗi.

## Luồng làm việc gợi ý

1. Tạo nhánh từ `develop` hoặc `main` (theo quy ước team):

   `feature/user-profile`

2. Làm việc, commit, đẩy lên GitLab → pipeline chạy **install → build → test → docker** (không deploy).

3. Merge vào `develop` (qua Merge Request) → pipeline tương tự, không deploy.

4. Khi sẵn sàng lên môi trường production: merge `develop` → `main` (hoặc MR vào `production`) → pipeline đầy đủ **và** job **deploy** chạy trên nhánh được phép.

## Lệnh Git thường dùng

```bash
# Cập nhật nhánh gốc
git fetch origin
git checkout develop
git pull origin develop

# Tạo nhánh feature
git checkout -b feature/ten-tinh-nang

# Đẩy nhánh lên remote
git push -u origin feature/ten-tinh-nang

# Sau khi MR được merge, xóa nhánh local (tùy chọn)
git checkout develop
git pull origin develop
git branch -d feature/ten-tinh-nang
```

```bash
# Chuẩn bị release: merge develop vào main (trên máy — thường nên làm qua MR trên GitLab)
git checkout main
git pull origin main
git merge --no-ff develop
git push origin main
```

Protected branches trên GitLab nên bật cho `main` / `production` (chỉ Maintainer merge, bắt buộc pipeline thành công nếu team áp dụng).

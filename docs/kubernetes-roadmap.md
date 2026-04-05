# Hướng nâng cấp CI/CD lên Kubernetes (giai đoạn tùy chọn)

Tài liệu này **không** triển khai manifest cụ thể; chỉ mô tả kiến trúc và lộ trình từ Docker Compose trên một máy chủ (VPS) sang Kubernetes.

## Kiến trúc tổng quan

| Thành phần | Vai trò trong k8s |
|------------|-------------------|
| **Pod** | Một hoặc nhiều container chạy cùng node (ví dụ sidecar logging). Backend và frontend thường là **mỗi service một Deployment** (mỗi Pod một container chính). |
| **Deployment** | Giữ số bản sao (replicas) ổn định, rolling update khi đổi image (tag mới từ registry). |
| **Service** | IP/DNS nội bộ cluster: `Service` kiểu ClusterIP cho backend ↔ postgres (nếu postgres trong cluster) hoặc Endpoint ra managed DB. |
| **Ingress** | HTTP/HTTPS từ Internet → Service frontend (và có thể path `/api` → backend). |
| **ConfigMap / Secret** | Biến môi trường không nhạy cảm vs mật khẩu, `DATABASE_URL`, TLS. |
| **PersistentVolumeClaim** | Dữ liệu Postgres nếu chạy DB trong cluster (hoặc dùng RDS / Managed PostgreSQL bên ngoài). |

## Lộ trình di chuyển từ Docker Compose

1. **Giữ GitLab CI** build và push image lên registry (GitLab Container Registry hoặc ECR/GCR).
2. **Thay job deploy SSH** bằng deploy qua API cluster:
   - Cách phổ biến: **Helm** hoặc **`kubectl apply`** / **Kustomize** trong job CI (runner có `kubectl` + kubeconfig từ biến CI/CD type File, protected).
3. **Tách stateful Postgres**: hackathon có thể giữ một managed DB; production nên tránh Postgres trong Pod không có vận hành backup.
4. **Ingress + TLS**: cert-manager + Let's Encrypt, hoặc LB của cloud (DO Load Balancer, AWS ALB).

## Công cụ gợi ý

- **kubectl** — CLI quản lý cluster.
- **Helm** — đóng gói chart (frontend, backend, ingress rules).
- **Kustomize** — overlay theo môi trường (staging/production) không nhân đôi YAML.
- **Argo CD / Flux** (GitOps) — cluster đồng bộ trạng thái từ Git; phù hợp khi team lớn hơn.

## Gợi ý pipeline sau khi có k8s

Stages có thể là: `install` → `build` → `test` → `docker` → `deploy`, trong đó stage **deploy** chạy `helm upgrade --install` hoặc `kubectl set image` chỉ trên nhánh `main` / `production`, tương tự quy tắc hiện tại.

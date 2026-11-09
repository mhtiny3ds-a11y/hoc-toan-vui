# Học Toán Vui

Web app học toán tư duy **miễn phí** cho bé, đi theo đúng thứ tự **120 tập Numberblocks (Mùa 1 → Mùa 6)** trong thư mục Google Drive của gia đình. App không cần máy chủ và chạy được ngay trên GitHub Pages. Phong cách giao diện tham khảo Lumi English.

> Học Toán Vui là ứng dụng độc lập, không phải sản phẩm chính thức của Numberblocks, Blue Zoo, Alphablocks Ltd hay BBC. Các nhân vật Su, Bi, Xu và toàn bộ nội dung luyện tập do app tự biên soạn.

## Nhân vật

| | Nhân vật | Vai trò |
|---|---|---|
| 🦖 | **Su**, khủng long xanh | Thầy dạy toán, giảng bài, khen và động viên |
| 🐝 | **Bi**, ong vàng | Giữ sổ nhiệm vụ làm ở nhà |
| 🐷 | **Xu**, heo đất | Giữ hũ sao và tiền thưởng |

## Chương trình học

| Mùa | Thế giới | Số bài | Nội dung |
|---|---|---|---|
| 1 | ⛰️ Đồi Số Đếm | 20 | Số 0–5, đếm, gộp, tách, so sánh |
| 2 | 🌈 Thung Lũng Phép Cộng | 30 | Số 6–10, cộng, trừ, chẵn lẻ, gấp đôi, bạn của 10 |
| 3 | 🏙️ Thành Phố Số 20 | 30 | Số 11–20, chục và đơn vị, hình chữ nhật, nhân, chia |
| 4 | 🎪 Rạp Xiếc Số Lớn | 5 | Số 21–50, số vuông, đếm theo chục |
| 5 | 🗼 Tháp Trăm Nghìn | 5 | Số 60–1000, hàng trăm, hàng nghìn |
| 6 | 🚀 Vũ Trụ Phép Nhân | 30 | Bảng nhân, thừa số, số nguyên tố, số vuông, bậc thang |

Mỗi bài tương ứng **một tập** (ví dụ S01E01) và gồm:

1. **Học**: 3 trang Su giảng bằng hình minh họa (khối, tia số, mảng, bậc thang, khối 3D…). Su có thể đọc to bằng giọng tiếng Việt của máy.
2. **Luyện tập**: 8 câu sinh ngẫu nhiên nên mỗi lần học lại sẽ khác. App có hơn 50 dạng bài như đếm, xếp khối, nhìn nhanh, tách số, so sánh, chẵn lẻ, đếm cách, chục–đơn vị, nhân, chia, toán có lời văn…
3. **Nhiệm vụ ở nhà**: một hoạt động thực tế, có bài kèm phiếu in trong Drive.

Sau mỗi 5 bài có một **Thử thách** ôn tập gồm 10 câu. Các bài mở lần lượt theo thứ tự, và mùa sau chỉ mở khi con xong mùa trước. Ba mẹ có thể bật "Mở khóa toàn bộ".

Nội dung nằm trong `js/curriculum.js`, mỗi tập một dòng. Dạng bài và hình minh họa được định nghĩa trong `js/engine.js`.

## Đồng hành cùng con

App nhắc ba mẹ ở màn chào, bản đồ học, trang bài học, màn kết quả và khu vực ba mẹ: *"Ba mẹ ơi, dành 10 phút mỗi ngày đồng hành cùng Su và con nhé"*.

## Sao thưởng

- Mỗi sao = **1.000đ**. Tối đa **50 sao/tuần** (50.000đ). Ba mẹ có thể hạ giới hạn xuống 10–45 sao.
- Bài học và thử thách cho 1–3 sao tùy số câu đúng. Học lại chỉ được thêm sao khi làm tốt hơn lần trước.
- Nhiệm vụ ở nhà được ba mẹ xác nhận thì con nhận +2 sao. Ba mẹ cũng có thể tặng thêm sao kèm lý do.
- Sao vượt mức tuần vẫn được ghi lại nhưng không tính tiền. Trong **Ví thưởng**, ba mẹ bấm "Đã trao" để ghi sổ.
- Có chuỗi ngày học 🔥, mục tiêu 2 bài/ngày và 14 huy hiệu.

## Tài khoản

- **Ba mẹ** đăng nhập bằng số điện thoại/email và mật khẩu. Khi tạo tài khoản, ba mẹ đặt thêm một **mã PIN ba mẹ** (4 số).
- **Con** chọn hình đại diện rồi nhập **mã PIN 4 số** riêng. Một gia đình có thể có nhiều con.
- Khu vực ba mẹ gồm 4 tab: Tổng quan (tiến độ, gợi ý ôn tập), Duyệt nhiệm vụ, Ví thưởng, Tài khoản (thêm/sửa con, giới hạn sao, mở khóa bài, đổi mật khẩu, sao lưu/khôi phục).
- Khu vực ba mẹ **tự khóa** sau 10 phút không thao tác hoặc khi mở lại app. Muốn mở lại phải nhập mật khẩu hoặc PIN ba mẹ.
- Quên mật khẩu: dùng mã PIN ba mẹ để đặt lại. Nếu nhập sai 5 lần, app khóa 1 phút.
- Mật khẩu và mã PIN được băm SHA-256 trước khi lưu.

**Gia đình mẫu:** ba mẹ `demo` / `123456`, PIN ba mẹ `0000`. Bông: PIN `1111`, Tí: PIN `2222`.

## Dữ liệu

Toàn bộ dữ liệu lưu trong **trình duyệt của từng máy** (localStorage). Để chuyển sang máy khác, vào **Tài khoản → Tải file sao lưu**, rồi trên máy mới chọn **Khôi phục từ file sao lưu**.

## Donate

Ở màn **Ba mẹ đăng nhập** và tab **Tổng quan** có mã VietQR (MB Bank · TAO MINH HIEN · 141431319191), file `assets/donate-qr.jpg`.

## Chạy và đưa lên GitHub Pages

- Chạy trên máy: `python3 -m http.server`, rồi mở `http://localhost:8000`.
- GitHub Pages: vào **Settings → Pages → Deploy from a branch**, chọn nhánh và thư mục `/ (root)`.
- App có `manifest.webmanifest` và `sw.js`, nên có thể "Thêm vào màn hình chính" và mở khi mất mạng.

## Cấu trúc

```
index.html            khung trang
css/style.css         giao diện (sáng/tối)
js/curriculum.js      120 bài học và link phiếu in trên Drive
js/engine.js          hình minh họa + bộ sinh câu hỏi
js/mascots.js         nhân vật Su, Bi, Xu (SVG)
js/app.js             tài khoản, bản đồ, bài học, sao thưởng, khu vực ba mẹ
assets/               icon, mã QR donate
```

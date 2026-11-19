# Học Toán Vui

Web app học toán tư duy **miễn phí, phi thương mại** cho bé: **6 chặng, 120 bài** từ đếm số đến bảng nhân. App không cần máy chủ và chạy được ngay trên GitHub Pages. Phong cách giao diện tham khảo Lumi English.

> Học Toán Vui là ứng dụng độc lập. Toàn bộ bài giảng, câu hỏi, hình minh họa, nhiệm vụ và nhân vật (Su, Bi, Xu) do Học Toán Vui tự biên soạn từ kiến thức toán phổ thông. Ứng dụng không liên kết, không được tài trợ hay bảo trợ bởi bất kỳ chương trình, thương hiệu, nhà xuất bản hay tổ chức giáo dục nào. Xem đầy đủ trong mục **Điều khoản & lưu ý** của app.

## Nhân vật

| | Nhân vật | Vai trò |
|---|---|---|
| 🦖 | **Su**, khủng long xanh | Thầy dạy toán, giảng bài, khen và động viên |
| 🐝 | **Bi**, ong vàng | Giữ sổ nhiệm vụ làm ở nhà |
| 🐷 | **Xu**, heo đất | Giữ hũ sao và tiền thưởng |

## Chương trình học

| Chặng | Thế giới | Số bài | Nội dung |
|---|---|---|---|
| 1 | ⛰️ Đồi Số Đếm | 20 | Số 0–5, đếm, gộp, tách, so sánh |
| 2 | 🌈 Thung Lũng Phép Cộng | 30 | Số 6–10, cộng, trừ, chẵn lẻ, gấp đôi, bạn của 10 |
| 3 | 🏙️ Thành Phố Số 20 | 30 | Số 11–20, chục và đơn vị, hình chữ nhật, nhân, chia |
| 4 | 🎪 Rạp Xiếc Số Lớn | 5 | Số 21–50, số vuông, đếm theo chục |
| 5 | 🗼 Tháp Trăm Nghìn | 5 | Số 60–1000, hàng trăm, hàng nghìn |
| 6 | 🚀 Vũ Trụ Phép Nhân | 30 | Bảng nhân, thừa số, số nguyên tố, số vuông, bậc thang |

Mỗi bài (ví dụ C1·B01 = Chặng 1, Bài 1) gồm:

1. **Học**: 3 trang Su giảng bằng hình minh họa (khối, tia số, mảng, bậc thang, khối 3D…). Su có thể đọc to bằng giọng tiếng Việt của máy.
2. **Luyện tập**: 8 câu sinh ngẫu nhiên nên mỗi lần học lại sẽ khác. App có hơn 50 dạng bài như đếm, xếp khối, nhìn nhanh, tách số, so sánh, chẵn lẻ, đếm cách, chục–đơn vị, nhân, chia, toán có lời văn…
3. **Nhiệm vụ ở nhà**: một hoạt động thực tế với đồ vật quen thuộc trong nhà.

Sau mỗi 5 bài có một **Thử thách** ôn tập gồm 10 câu. Các bài mở lần lượt theo thứ tự, và chặng sau chỉ mở khi con xong chặng trước.

**Mở khóa theo trình độ:** trong Khu vực ba mẹ (tab Tổng quan hoặc Tài khoản → 🔓 Mở khóa bài theo trình độ), ba mẹ chọn riêng cho từng con: tích từng bài, mở cả chặng, hoặc mở toàn bộ 120 bài. Bài được mở có biểu tượng 🔑 trên bản đồ và trở thành bài "Học tiếp"; các bài sau đó tự mở dần khi con học xong. Bỏ tích để khóa lại, kết quả bài con đã học vẫn giữ. Ngoài ra vẫn có công tắc "Mở khóa toàn bộ bài học cho tất cả các con".

Nội dung nằm trong `js/curriculum.js`, mỗi bài một dòng. Dạng bài và hình minh họa được định nghĩa trong `js/engine.js`.

## Đồng hành cùng con

App nhắc ba mẹ ở màn chào, bản đồ học, trang bài học, màn kết quả và khu vực ba mẹ: *"Ba mẹ ơi, dành 10 phút mỗi ngày đồng hành cùng Su và con nhé"*.

## Thú cưng

Ngoài hũ sao, mỗi con chọn nuôi một bạn ở tab **Thú cưng**: **Rồng Lửa**, **Mèo Mây** hoặc **Cún Sao**, và tự đặt tên.

- Mỗi bài học hoặc thử thách con làm xong, thú cưng được **ăn một bữa** và cảm ơn con đã chăm chỉ học bài.
- Thú cưng **lớn lên theo lộ trình học** (số bài + thử thách đã hoàn thành): Quả trứng → Em bé (1) → Nhóc con (8) → Thiếu niên (25) → Trưởng thành (55) → Huyền thoại (95). Mỗi giai đoạn to hơn và đổi hình dáng: sừng, cánh, mây bông, vòng sao, áo choàng, vương miện. Cấp = số bài đã hoàn thành + 1.
- Ngày chưa học, thú cưng ngủ gật và nhắc con học bài. Đổi tên hoặc đổi loài vẫn giữ nguyên cấp.
- Hình thú cưng vẽ bằng SVG trong `js/pets.js`.

## Sao thưởng

- Mỗi sao = **1.000đ**. Tối đa **50 sao/tuần** (50.000đ). Ba mẹ có thể hạ giới hạn xuống 10–45 sao.
- Bài học và thử thách cho 1–3 sao tùy số câu đúng. Học lại chỉ được thêm sao khi làm tốt hơn lần trước.
- Nhiệm vụ ở nhà được ba mẹ xác nhận thì con nhận +2 sao. Ba mẹ cũng có thể tặng thêm sao kèm lý do.
- Sao vượt mức tuần vẫn được ghi lại nhưng không tính tiền. Trong **Ví thưởng**, ba mẹ bấm "Đã trao" để ghi sổ.
- Có chuỗi ngày học 🔥, mục tiêu 2 bài/ngày và 14 huy hiệu.

## Tài khoản

- **Ba mẹ** đăng nhập bằng số điện thoại/email và mật khẩu. Khi tạo tài khoản, ba mẹ đặt thêm một **mã PIN ba mẹ** (4 số).
- **Con** chọn hình đại diện rồi nhập **mã PIN 4 số** riêng. Một gia đình có thể có nhiều con.
- Khu vực ba mẹ gồm 4 tab: Tổng quan (tiến độ, gợi ý ôn tập), Duyệt nhiệm vụ, Ví thưởng, Tài khoản (thêm/sửa con, giới hạn sao, mở khóa bài theo trình độ từng con, đổi mật khẩu, sao lưu/khôi phục).
- Khu vực ba mẹ **tự khóa** sau 10 phút không thao tác hoặc khi mở lại app. Muốn mở lại phải nhập mật khẩu hoặc PIN ba mẹ.
- Quên mật khẩu: dùng mã PIN ba mẹ để đặt lại. Nếu nhập sai 5 lần, app khóa 1 phút.
- Mật khẩu và mã PIN được băm SHA-256 trước khi lưu.

**Gia đình mẫu:** ba mẹ `demo` / `123456`, PIN ba mẹ `0000`. Bông: PIN `1111`, Tí: PIN `2222`.

## Dữ liệu

App **không gọi tới máy chủ bên ngoài nào**: font chữ Baloo 2 và Nunito được lưu sẵn trong `assets/fonts/` (giấy phép SIL Open Font License, kèm file `OFL-*.txt`), nên địa chỉ IP của người dùng không bị gửi tới Google Fonts. Mã QR, hình ảnh và nhân vật cũng đều nằm trong repo.

Toàn bộ dữ liệu lưu trong **trình duyệt của từng máy** (localStorage). Để chuyển sang máy khác, vào **Tài khoản → Tải file sao lưu**, rồi trên máy mới chọn **Khôi phục từ file sao lưu**.

## Ủng hộ (donate)

Ở màn **Ba mẹ đăng nhập** và tab **Tổng quan** có khối *"Mời ly Coffee để Khủng long Su có thêm sức mạnh đồng hành và phát triển cùng các con nha ba mẹ ☕"* (MB Bank · TAO MINH HIEN · 141431319191):

- 3 lựa chọn, giao diện chỉ hiện tên loại cà phê: **🧊 Sữa đá** (40.000đ), **☕ Latte** (56.000đ), **🧂 Cà phê Muối** (66.000đ). Mỗi mã VietQR có sẵn số tiền và nội dung chuyển khoản **"Thank you Su"** (`assets/donate-qr-sua-da.png`, `-latte`, `-ca-phe-muoi`).
- Nút **Tải mã QR về máy** để ba mẹ lưu ảnh rồi quét từ thư viện trong app ngân hàng.
- Khối ủng hộ **chỉ hiện khi ít nhất một bé đã hoàn thành 3 bài học** (tính trên các gia đình lưu trong máy).

- Ủng hộ hoàn toàn **tự nguyện**, là quà tặng cá nhân để duy trì ứng dụng; **không phải** thanh toán mua hàng, phí dịch vụ hay phí thành viên.
- Ứng dụng luôn miễn phí đầy đủ; ủng hộ không kèm quyền lợi, ưu đãi hay nghĩa vụ nào giữa hai bên, và không được hoàn lại.

## Điều khoản & lưu ý

Trang **Điều khoản & lưu ý** trong app (mở từ màn chào, form đăng ký, khối ủng hộ, Ví thưởng và tab Tài khoản) nêu rõ:

- **Nội dung bài học**: tự biên soạn từ kiến thức toán phổ thông, chỉ để tham khảo và ôn luyện tại nhà, không thay thế chương trình chính thức, không cam kết kết quả; có kênh liên hệ để gỡ/sửa nội dung nếu ai đó cho rằng ảnh hưởng đến quyền của họ.
- **Sao thưởng**: là công cụ khích lệ trong gia đình; quy đổi 1 sao = 1.000đ chỉ là gợi ý; app không giữ, không chuyển, không thanh toán tiền; sao không có giá trị quy đổi.
- **Ủng hộ**: như mục trên.
- **Dữ liệu**: chỉ lưu trên máy, không thu thập hay gửi đi; ba mẹ tự sao lưu.
- **Trẻ em**: tài khoản do ba mẹ tạo, trẻ học dưới sự đồng hành của ba mẹ.
- **Miễn trừ trách nhiệm**: ứng dụng cung cấp "nguyên trạng".

Khi tạo tài khoản, ba mẹ phải tích ô xác nhận đã đọc và đồng ý điều khoản.

## Chạy và đưa lên GitHub Pages

- Chạy trên máy: `python3 -m http.server`, rồi mở `http://localhost:8000`.
- GitHub Pages: vào **Settings → Pages → Deploy from a branch**, chọn nhánh và thư mục `/ (root)`.
- App có `manifest.webmanifest` và `sw.js`, nên có thể "Thêm vào màn hình chính" và mở khi mất mạng.

## Cấu trúc

```
index.html            khung trang
css/style.css         giao diện (sáng/tối)
js/curriculum.js      120 bài học
js/engine.js          hình minh họa + bộ sinh câu hỏi
js/mascots.js         nhân vật Su, Bi, Xu (SVG)
js/app.js             tài khoản, bản đồ, bài học, sao thưởng, khu vực ba mẹ
assets/               icon, mã QR donate
```

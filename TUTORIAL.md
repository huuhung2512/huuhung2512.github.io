# HƯỚNG DẪN SỬ DỤNG PROFILE VIP (PHIÊN BẢN GAME DEV)

Profile của bạn bây giờ đã được nâng cấp lên hệ thống "Động" (Dynamic System). Bạn không cần biết code HTML vẫn có thể thêm game mới được!

## 1. Cách Thêm Game Mới

Tất cả dữ liệu game nằm trong file `games.json`. Bạn mở file này bằng Notepad hoặc Code Editor đều được.

### Cấu Trúc:
Mỗi game nằm trong dấu ngoặc nhọn `{}`, cách nhau bởi dấu phẩy `,`.

```json
{
    "title": "TÊN GAME CỦA BẠN",
    "genre": "THỂ LOẠI (RPG, ACTION, ETC.)",
    "image": "LINK ẢNH HOẶC ĐƯỜNG DẪN ẢNH",
    "url": "LINK IFRAME ITCH.IO HOẶC LINK GAME WEBGL",
    "width": 1024,
    "height": 740
}
```

### Bước làm:
1.  Copy một đoạn `{ ... }` mẫu ở trên.
2.  Dán nó xuống dưới cùng danh sách (nhớ thêm dấu phẩy `,` ở cái cũ phía trước).
3.  Sửa thông tin:
    *   **title**: Tên game in hoa cho đẹp.
    *   **image**: Link ảnh trên mạng hoặc đường dẫn ảnh trong máy (ví dụ: `images/mygame.png`).
    *   **url**: Vào trang game Itch.io của bạn -> Edit Game -> Distribute -> Embed Game -> Copy đoạn link trong `src="..."`.
    *   **width/height**: Copy từ Embed code của Itch.io luôn cho chuẩn.

## 2. Cách Thay Đổi Thông Tin Player 1

Để sửa tên, Level, Bio, bạn sửa trực tiếp trong file `index.html`. Tìm đoạn:

*   **Tên**: Tìm `HUUHUNG` -> Sửa thành tên bạn.
*   **Level**: Tìm `LVL 99` -> Sửa số.
*   **Bio (Chữ gõ máy tính)**: Mở file `script.js`, tìm dòng:
    `const text = "Initializing dev profile...\nSubject: Huu Hung...";`
    Sửa nội dung trong ngoặc kép. Dùng `\n` để xuống dòng.

## 3. Cách Tắt Hiệu Ứng Boot

Nếu chán cảnh khởi động "Hack não", bạn vào `style.css`, tìm `#boot-screen` và thêm dòng `display: none !important;`.

---
**Chúc bạn có một profile "xịn xò" nhất Vịnh Bắc Bộ!** 🎮

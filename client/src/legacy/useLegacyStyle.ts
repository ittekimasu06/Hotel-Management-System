import { useLayoutEffect } from "react";

/**
 * Gắn CSS của giao diện cũ vào <head> khi layout đang hiển thị và gỡ ra khi rời đi.
 * Trang khách (EstateAgency) và trang quản trị (NiceAdmin) có CSS trùng selector
 * (body, .header, .footer...) nên không thể nạp cả hai cùng lúc.
 */
export function useLegacyStyle(id: string, css: string) {
  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.dataset.legacy = id;
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, [id, css]);
}

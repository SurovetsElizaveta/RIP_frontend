const target_tauri = false

export const api_proxy_addr = "http://172.20.32.1:8080"
export const img_proxy_addr = "http://172.20.32.1:9000"
export const dest_api = (target_tauri) ? api_proxy_addr : "/api"
export const dest_img =  (target_tauri) ?  img_proxy_addr : "/img-proxy"
export const dest_root = (target_tauri) ? "" : "/"
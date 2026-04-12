# Tiktokをwebで開く
# 言語を日本語にする
# 任意のLiveを視聴する
# F12で開発者モードを開く
# ページ再読み込みを行い、ネットワークの監視を停止する。
# listの内容をコピーし、INPUT_FILEに記載。
# 本Scriptを実行する

import json
from pathlib import Path
from urllib.parse import urlparse

import requests

INPUT_FILE = "gift_json.txt"
OUTPUT_TS_FILE = Path("data/gifts.ts")
IMAGE_DIR = Path("public/images")

REQUEST_TIMEOUT = 20

def extract_gifts(data):
    if isinstance(data, dict):
        if isinstance(data.get("gifts"), list):
            return data["gifts"]
        for value in data.values():
            result = extract_gifts(value)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = extract_gifts(item)
            if result:
                return result
    return []

def pick_image_url(gift):
    image = gift.get("image")
    if isinstance(image, dict):
        url_list = image.get("url_list")
        if isinstance(url_list, list) and url_list:
            return url_list[0]

    icon = gift.get("icon")
    if isinstance(icon, dict):
        url_list = icon.get("url_list")
        if isinstance(url_list, list) and url_list:
            return url_list[0]

    return ""

def infer_extension_from_url(url):
    parsed = urlparse(url)
    path = parsed.path.lower()

    if ".png" in path:
        return ".png"
    if ".jpg" in path or ".jpeg" in path:
        return ".jpg"
    if ".webp" in path:
        return ".webp"

    return ".img"

def download_image(url, save_path):
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        save_path.write_bytes(response.content)
        return True, ""
    except Exception as e:
        return False, str(e)

def to_ts_object_string(items):
    json_body = json.dumps(items, ensure_ascii=False, indent=2)
    return f"export const gifts = {json_body};\n"

def main():
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_TS_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    gifts = extract_gifts(data)
    if not gifts:
        raise RuntimeError("gifts 配列が見つかりませんでした。")

    result = []

    for gift in gifts:
        gift_id = gift.get("id")
        name = gift.get("name")
        coin = gift.get("diamond_count", 0)
        image_url = pick_image_url(gift)

        if gift_id is None or name is None:
            continue

        local_image_path_str = ""

        if image_url:
            ext = infer_extension_from_url(image_url)
            image_file_path = IMAGE_DIR / f"{gift_id}{ext}"

            success, error = download_image(image_url, image_file_path)
            if success:
                local_image_path_str = f"/images/{gift_id}{ext}"
            else:
                print(f"[WARN] 画像ダウンロード失敗: id={gift_id}, error={error}")

        result.append(
            {
                "id": gift_id,
                "name": name,
                "coin": coin,
                "imageUrl": local_image_path_str,
            }
        )

    result.sort(key=lambda x: (x["coin"], x["id"]))

    ts_content = to_ts_object_string(result)

    with open(OUTPUT_TS_FILE, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"gifts.ts を生成しました: {OUTPUT_TS_FILE}")
    print(f"画像保存先: {IMAGE_DIR}")
    print(f"件数: {len(result)}")

if __name__ == "__main__":
    main()

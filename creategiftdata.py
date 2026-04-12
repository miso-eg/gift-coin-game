# Tiktokをwebで開く
# 言語を日本語にする
# 任意のLiveを視聴する
# F12で開発者モードを開く
# ページ再読み込みを行い、ネットワークの監視を停止する。
# listの内容をコピーし、INPUT_FILEに記載。
# 本Scriptを実行する

import json

INPUT_FILE = "gift_json.txt"
OUTPUT_FILE = "data/gifts.ts"

def extract_gifts(data):
    # gifts配列を再帰的に探す
    if isinstance(data, dict):
        if "gifts" in data:
            return data["gifts"]
        for v in data.values():
            result = extract_gifts(v)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = extract_gifts(item)
            if result:
                return result
    return []

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

gifts = extract_gifts(data)

result = []

for gift in gifts:
    name = gift.get("name")
    coin = gift.get("diamond_count", 0)

    # image優先、なければicon
    image_url = ""
    if "image" in gift and gift["image"].get("url_list"):
        image_url = gift["image"]["url_list"][0]
    elif "icon" in gift and gift["icon"].get("url_list"):
        image_url = gift["icon"]["url_list"][0]

    result.append({
        "id": gift.get("id"),
        "name": name,
        "coin": coin,
        "imageUrl": image_url
    })

# coinでソート（任意）
result.sort(key=lambda x: x["coin"])

# TypeScript形式に変換
ts_content = "export const gifts = " + json.dumps(result, ensure_ascii=False, indent=2) + ";\n"

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(ts_content)

print("gifts.ts 生成完了")
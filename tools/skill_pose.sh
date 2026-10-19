#!/bin/zsh
# 用法: tools/skill_pose.sh <卡片id>  → work/skill/<id>.png（洋紅底發招姿勢，之後 skill_cut.py 去背）
cd "$(dirname $0)/.."
id=$1
tools/gen.sh skill-$id "Photorealistic cinematic live-action character art of the SAME person as the reference card: same face, same hairstyle, same costume, same accessories, same colors. Only items visible in the reference; do not add any new clothing, weapon, prop, hat, jewelry, wings or armor that the reference does not show. Pose: a powerful dramatic skill-casting battle pose, body and face both facing the viewer, one arm thrust forward toward the camera with an open palm, the other arm drawn back, determined intense expression, slight low camera angle. Head, shoulders and hips face the same direction; no twisted neck, no looking back over the shoulder, no turning around. Knee-up framing, vertical 2:3, whole figure inside the frame, hands fully inside the frame. Background must be a perfectly flat solid pure magenta #FF00FF everywhere: no shadow, no gradient, no floor, no smoke, no glow, no particles, no lightning, no magic effects. No text, no watermark." art/$id.png
mv art/skill-$id.png work/skill/$id.png 2>/dev/null

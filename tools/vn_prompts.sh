#!/bin/zsh
# 用法: tools/vn_prompts.sh <key> <表情> -> 生立繪 (normal 無參考基準；其他表情以 normal 當參考)
cd "$(dirname $0)/.."
key=$1; ex=$2
COMMON="Visual novel character sprite, photorealistic cinematic live-action look matching the reference card art (same face, same costume, same realistic AI-actor style). Upright front-facing standing pose, waist-up to knee-up, vertical 2:3 portrait, character fills about 85% of the image height with a little empty space above the head, both hands fully inside the frame and not cropped. Head, shoulders, hips and feet face the same direction toward the viewer; no twisted neck, no looking back, no turning around. Background must be a perfectly flat solid pure magenta #FF00FF everywhere, no shadow, no gradient, no floor, no props behind, no glow or smoke. No text, no watermark."
case $key in
 yutong) D="Young Taiwanese woman, short mint-green bob haircut with bangs, round black-frame glasses, a red birthmark patch on one cheek, wearing a plain white collared uniform shirt (no robe, no Hanfu)." ; R=(art/yutong.png src/qimiao-shiguang/assets/c/c044.jpg src/qimiao-shiguang/assets/g/c044-1.jpg);;
 lee) D="Middle-aged man wearing a dark navy-blue Qing dynasty official's robe with a black Qing official hat (karma-mirror arhat styling), stern dignified face." ; R=(art/lee3.png refs/lee-arhat.jpg);;
 linbobo) D="Elderly kind uncle in the same outfit and face as the reference card." ; R=(art/linbobo.png);;
 bohong) D="Same man and same outfit as the reference card." ; R=(art/bohong.png);;
 yuelao) D="Same matchmaker deity elder and same outfit as the reference card." ; R=(art/yuelao.png);;
 rat) D="A hamster strategist character, same as the reference card, standing upright on its hind legs." ; R=(art/rat.png);;
 leviathan) D="Same character and costume as the reference card." ; R=(art/leviathan.png);;
esac
declare -A E
E[normal]="Calm neutral expression, mouth closed."
E[angry]="Angry expression: furrowed brows, glaring eyes, clenched teeth."
E[sad]="Sad expression: downcast eyes with tears welling up, trembling lips."
E[smile]="Gentle warm smile."
E[pain]="In sharp pain: one hand pressed to the chest, brows tightly knit, eyes squeezed, grimacing."
E[serious]="Serious solemn expression, firm gaze, mouth closed."
E[smug]="Smug self-satisfied smirk, chin slightly raised."
if [[ $ex == normal ]]; then
  tools/gen.sh vn-$key-normal "$D $COMMON ${E[normal]}" $R
else
  tools/gen.sh vn-$key-$ex "Same exact character, same costume, same pose and framing and same flat magenta background as the first reference image (the base sprite). Only the facial expression changes. $COMMON ${E[$ex]}" work/vn/vn-$key-normal.png $R
fi
mv art/vn-$key-$ex.png work/vn/ 2>/dev/null

#!/bin/zsh
# 用法: tools/vn_prompts.sh <key> <表情> -> 生立繪 (normal 無參考基準；其他表情以 normal 當參考)
cd "$(dirname $0)/.."
key=$1; ex=$2
COMMON="Visual novel character sprite, photorealistic cinematic live-action look matching the reference card art (same face, same costume, same realistic AI-actor style). Upright front-facing standing pose, waist-up to knee-up, vertical 2:3 portrait, character fills about 85% of the image height with a little empty space above the head, both hands fully inside the frame and not cropped. Head, shoulders, hips and feet face the same direction toward the viewer; no twisted neck, no looking back, no turning around. Background must be a perfectly flat solid pure magenta #FF00FF everywhere, no shadow, no gradient, no floor, no props behind, no glow or smoke. No text, no watermark."
case $key in
 yutong) D="Young Taiwanese woman, short mint-green bob haircut with bangs and black roots, black round-frame glasses, a dark reddish birthmark around one eye (a harmless congenital skin mark), wearing an orange-red short-sleeve sports T-shirt with black sleeves and black collar trim, and navy-blue athletic shorts; bare legs, knees visible. No robe, no red thread, no white shirt, no accessories." ; R=(src/qimiao-shiguang/assets/ep/ep2-15.jpg src/qimiao-shiguang/assets/ep/ep3-01.jpg src/qimiao-shiguang/assets/c/c044.jpg);;
 lee) D="Thin middle-aged man in a tall black top hat, black suit jacket over a white dress shirt and dark necktie, stern gaunt face; only items shown in the references, no purple lightning, no Qing robe." ; R=(art/lee4.png refs/lee-suit1.jpg refs/lee-suit2.jpg refs/lee-suit-chart.jpg);;
 linbobo) D="Elderly kind uncle in the same outfit and face as the reference card." ; R=(art/linbobo.png);;
 bohong) D="Teenage sprinter with short spiky black hair, wearing a black zip-up athletic track jacket with white stripes and black track pants, exactly like the reference card." ; R=(art/bohong.png);;
 yuelao) D="Same matchmaker deity elder and same outfit as the reference card." ; R=(art/yuelao.png);;
 rat) D="A hamster strategist character, same as the reference card, standing upright on its hind legs." ; R=(art/rat.png);;
 leviathan) D="Young man with silver hair with blue tips, blue glitter makeup on the cheek, black jacket, black headphones hanging around his neck; only items shown in the references, nothing added." ; R=(art/leviathan.png src/qimiao-shiguang/assets/g/c059-1.jpg);;
 yutongh) D="Young Taiwanese woman, straight black bob haircut with full bangs, NO glasses, a red birthmark on one cheek decorated with a few tiny sparkling rhinestones, wearing a pale mint-green and white Hanfu, a small golden hair ornament; only items shown in the references." ; R=(art/yutong4.png src/qimiao-shiguang/assets/ep/ep4-08.jpg refs/yutong-chart.jpg);;
 youshuzhang) D="Handsome clean man with long black hair half tied up and a few white strands beside the face, wearing a white Hanfu with red-and-black patterned trim; clean face, no dirt, no blood; only items shown in the references." ; R=(art/youshuzhang.png src/qimiao-shiguang/assets/g/c052-3.jpg src/qimiao-shiguang/assets/ep/yl-04.jpg);;
 yangzi) D="Young woman with long black hair, a silver hair crown, white Hanfu with flowing black ribbons; only items shown in the references." ; R=(art/yangzi.png work/vn/refs/048.png src/qimiao-shiguang/assets/g/c064-1.jpg);;
 nova) D="Little girl with short black hair, wearing a blue narwhal-shaped hat and a light-blue sleeveless dress; only items shown in the references. Child proportions, full face visible." ; R=(art/nova.png src/qimiao-shiguang/assets/g/c060-1.jpg);;
 liudaniu) D="Qin-dynasty squad leader / prison guard, same man and same outfit as in the references; only items shown in the references." ; R=(art/liudaniu.png src/qimiao-shiguang/assets/g/c053-1.jpg);;
 guanyin) D="Guanyin in a modern look: white suit, silver-purple hair, thin-frame glasses, same as the references; only items shown." ; R=(art/guanyin.png src/qimiao-shiguang/assets/g/c005-3.jpg src/qimiao-shiguang/assets/g/c005-4.jpg);;
 qianliyan) D="General with a green feather mask and feather battle robe, same as the references; only items shown." ; R=(art/qianliyan.png src/qimiao-shiguang/assets/g/c070-1.jpg);;
esac
declare -A E
E[normal]="Calm neutral expression, mouth closed."
E[angry]="Angry expression: furrowed brows, glaring eyes, clenched teeth."
E[sad]="Quiet gentle expression with softly lowered eyelids and a slight downward curve of the mouth, like a wistful goodbye."
E[smile]="Gentle warm smile."
E[pain]="Heavy-hearted aching expression, one hand resting on her chest, brows drawn together, eyes closed, a pained sigh."
E[serious]="Serious solemn expression, firm gaze, mouth closed."
E[smug]="Smug self-satisfied smirk, chin slightly raised."
if [[ $ex == normal ]]; then
  tools/gen.sh vn-$key-normal "$D $COMMON ${E[normal]}" $R
else
  tools/gen.sh vn-$key-$ex "Same exact character, same costume, same pose and framing and same flat magenta background as the first reference image (the base sprite). Only the facial expression changes. $COMMON ${E[$ex]}" work/vn/vn-$key-normal.png $([[ $key == yutong* ]] || echo $R)
fi
mv art/vn-$key-$ex.png work/vn/ 2>/dev/null

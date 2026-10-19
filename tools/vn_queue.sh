#!/bin/zsh
# 讀 stdin 每行 "<key> <表情>"，最多 3 個並行；等待基準圖/卡面出現才生
cd "$(dirname $0)/.."
job() {
  key=$1; ex=$2
  [[ -f work/vn/vn-$key-$ex.png ]] && exit 0
  while [[ ! -f art/$key.png ]]; do sleep 20; done
  if [[ $ex != normal ]]; then while [[ ! -f work/vn/vn-$key-normal.png ]]; do sleep 20; done; fi
  tools/vn_prompts.sh $key $ex
}
export -f job 2>/dev/null
xargs -P2 -L1 zsh -c 'cd /Users/hermes/Public/0720/huangquan-puzzle; key=$0; ex=$1; [[ -f work/vn/vn-$key-$ex.png ]] && exit 0; if [[ $ex == normal ]]; then while [[ ! -f art/$key.png && $key != lee ]]; do sleep 20; done; fi; if [[ $ex != normal ]]; then while [[ ! -f work/vn/vn-$key-normal.png ]]; do sleep 20; done; fi; tools/vn_prompts.sh $key $ex'

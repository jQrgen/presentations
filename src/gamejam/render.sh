# Rebuild both variants: pptx -> pdf (soffice) -> png/slide-NN.png at 1024px
set -e
cd /workspace/gamejam-deck
for v in ntnu general; do
  .venv/bin/python build/make_deck.py $v
  if [ $v = ntnu ]; then dir=.; name=ntnu-blockchain-game-jam; else dir=general; name=blockchain-game-jam; fi
  (cd $dir && soffice --headless --convert-to pdf $name.pptx >/dev/null 2>&1 && rm -f png/*.png && mkdir -p png && pdftoppm -png -scale-to 1024 $name.pdf png/slide)
done

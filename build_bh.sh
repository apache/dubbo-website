(cd ./benchmark && npm install && npm run build)

rm -rf static/css/app.css
rm -rf static/css/chunk-vendors.css
rm -rf static/js/app.js
rm -rf static/js/chunk-vendors.js


for file in benchmark/dist/css/app.*.css; do
    cp "$file" "static/css/app.css"
    break
done

for file in benchmark/dist/css/chunk-vendors.*.css; do
    cp "$file" "static/css/chunk-vendors.css"
    break
done

for file in benchmark/dist/js/app.*.js; do
    cp "$file" "static/js/app.js"
    break
done

for file in benchmark/dist/js/chunk-vendors.*.js; do
    cp "$file" "static/js/chunk-vendors.js"
    break
done

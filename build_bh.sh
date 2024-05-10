(cd ./benchmark && npm install && npm run build)

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

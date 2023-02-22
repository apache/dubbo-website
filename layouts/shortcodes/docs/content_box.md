{{ with .Page.Params.content -}}
<div class="row">
{{ range $list_entry := . }}
{{ range $heading, $items := $list_entry }}

{{ range $items }}
<div class="col-sm col-md-6 mb-4">
  <div class="h-100 card shadow" href="#">
    <div class="card-body">
  {{ $item :=. }}
  <h4 class="card-title">
    {{ $item.name | $.Page.RenderString }}
  </h4>
  <p>{{ $item.description }}</p>
    </div>
  </div>
</div>
{{ end }}
{{ end }}
{{ end }}
</div>
{{ end -}}

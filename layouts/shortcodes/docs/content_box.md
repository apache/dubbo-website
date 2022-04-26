{{ $lang := lower ($.Page.Params.language | default $.Page.Params.title) -}}
{{ $src_repo_url := $.Page.Params.src_repo | default (printf "https://github.com/apache/dubbo-%s" $lang) -}}
{{ $src_repo_link := printf "[dubbo-%s repo](%s)" $lang $src_repo_url -}}

{{ with .Page.Params.content -}}
<div class="row">
{{ range $list_entry := . }}
{{ range $heading, $items := $list_entry }}
{{ $hd := printf "### %s" (humanize $heading) -}}

{{ range $items }}
<div class="col-sm col-md-6 mb-4">
  <div class="h-100 card shadow" href="#">
    <div class="card-body">
  {{ $item := replace . "$src_repo_url" $src_repo_url }}
  {{ $item = replace $item "$src_repo_link" $src_repo_link }}
  <h4 class="card-title">
    {{ $item | $.Page.RenderString }}
  </h4>
    </div>
  </div>
</div>
{{ end }}
{{ end }}
{{ end }}
</div>
{{ end -}}

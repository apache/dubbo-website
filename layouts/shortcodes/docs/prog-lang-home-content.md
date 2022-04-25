{{ $lang := lower ($.Page.Params.language | default $.Page.Params.title) -}}
{{ $src_repo_url := $.Page.Params.src_repo | default (printf "https://github.com/apache/dubbo-%s" $lang) -}}
{{ $src_repo_link := printf "[dubbo-%s repo](%s)" $lang $src_repo_url -}}

{{ with .Page.Params.content -}}
<div class="row flex-col flex-md-row o-lang-home__list">
{{ range $list_entry := . }}
{{ range $heading, $items := $list_entry }}
{{ $hd := printf "### %s" (humanize $heading) -}}
<div class="col-12 col-md-4">

{{ $hd }}

<ul>
{{ range $items }}
  <li>{{ $item | $.Page.RenderString }}</li>
{{ end }}
</ul>
</div>
{{ end }}
{{ end }}
</div>
{{ end -}}

---
title: "Dubbo Extension Market"
linkTitle: "Market"
weight: 10
description: "Browse, search, and contribute to the Apache Dubbo extension library."
---

# Dubbo Extension Market

The Dubbo Market provides a centralized view of extension libraries. Users can browse and search for specific SPI extensions to enhance their projects.

## 🔍 Search Extensions
<input type="text" id="marketSearch" onkeyup="searchTable()" placeholder="Search by name or category..." class="form-control mb-4" style="padding: 12px; width: 100%; border: 2px solid #007bff; border-radius: 8px;">

<div class="table-responsive">
  <table class="table table-hover" id="extensionTable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Description</th>
        <th>Version</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {{< market-table >}}
    </tbody>
  </table>
</div>

<script>
function searchTable() {
  var input = document.getElementById("marketSearch");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("extensionTable");
  var tr = table.getElementsByTagName("tr");
  for (var i = 1; i < tr.length; i++) {
    var visible = false;
    var td = tr[i].getElementsByTagName("td");
    for (var j = 0; j < td.length; j++) {
      if (td[j] && td[j].innerText.toUpperCase().indexOf(filter) > -1) {
        visible = true;
      }
    }
    tr[i].style.display = visible ? "" : "none";
  }
}
</script>

---

### 💡 User Feedback & Support
Users can provide feedback, suggestions, or obtain technical support for extensions:

[**Submit a New Market Suggestion**](https://github.com/apache/dubbo/issues/new?labels=type/enhancement,help+wanted&template=feature_request.yml&title=[Market+Suggestion]+)
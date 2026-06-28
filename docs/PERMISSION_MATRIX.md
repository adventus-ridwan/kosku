# Kos Map - Permission Matrix

| Feature                        | Public | Penjaga | Owner |
| ------------------------------ | :----: | :-----: | :---: |
| View Public Map                |    ✅   |    ✅    |   ✅   |
| View Room Details              |    ✅   |    ✅    |   ✅   |
| View Facilities                |    ✅   |    ✅    |   ✅   |
| Login                          |    ❌   |    ✅    |   ✅   |
| Open Admin                     |    ❌   |    ✅    |   ✅   |
| Edit Mode                      |    ❌   |    ✅    |   ✅   |
| Add Room                       |    ❌   |    ✅    |   ✅   |
| Edit Room                      |    ❌   |    ✅    |   ✅   |
| Delete Room                    |    ❌   |    ❌    |   ✅   |
| Add Facility                   |    ❌   |    ✅    |   ✅   |
| Edit Facility                  |    ❌   |    ✅    |   ✅   |
| Delete Facility                |    ❌   |    ❌    |   ✅   |
| Add Tenant                     |    ❌   |    ✅    |   ✅   |
| Edit Tenant                    |    ❌   |    ✅    |   ✅   |
| Finish Contract                |    ❌   |    ✅    |   ✅   |
| View Contract History          |    ❌   |    ✅    |   ✅   |
| View Dashboard                 |    ❌   |    ❌    |   ✅   |
| View Revenue                   |    ❌   |    ❌    |   ✅   |
| Export Reports                 |    ❌   |    ❌    |   ✅   |
| Manage Boarding House Settings |    ❌   |    ❌    |   ✅   |

---

# Notes

Owner has full access.

Penjaga manages daily operations but cannot access financial information.

Public has read-only access to public information only.

Permission must always be implemented through permission helper functions.

Never check roles directly inside components.

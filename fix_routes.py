import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Update project link creation
content = content.replace('href="/project-details/${project.slug}"', 'href="/project-details?slug=${project.slug}"')

# 2. Update routing logic condition
# Current: window.location.pathname.startsWith('/project-details/')
# New: window.location.pathname.includes('/project-details')
content = content.replace("window.location.pathname.startsWith('/project-details/')", "window.location.pathname.includes('/project-details')")

# 3. Update slug extraction
# Current: const slug = window.location.pathname.split('/').filter(Boolean).pop();
# New: const urlParams = new URLSearchParams(window.location.search);\n        const slug = urlParams.get('slug');
content = content.replace("const slug = window.location.pathname.split('/').filter(Boolean).pop();", "const urlParams = new URLSearchParams(window.location.search);\n        const slug = urlParams.get('slug');")

# 4. Update next/prev links
content = content.replace('href = `/project-details/${prevProject.slug}`', 'href = `/project-details?slug=${prevProject.slug}`')
content = content.replace('href = `/project-details/${nextProject.slug}`', 'href = `/project-details?slug=${nextProject.slug}`')

with open('app.js', 'w') as f:
    f.write(content)


import os

files_to_update = ['index.html', 'about/index.html', 'contact/index.html', 'projects/index.html', '404.html']

for file in files_to_update:
    with open(file, 'r') as f:
        content = f.read()

    # Asset paths
    content = content.replace('href="style.css"', 'href="/style.css"')
    content = content.replace('src="app.js"', 'src="/app.js"')
    content = content.replace('src="assets/', 'src="/assets/')
    content = content.replace('href="assets/', 'href="/assets/')
    content = content.replace('href="favicon.png"', 'href="/favicon.png"')
    
    # Internal links
    content = content.replace('href="index.html"', 'href="/"')
    content = content.replace('href="about.html"', 'href="/about"')
    content = content.replace('href="projects.html"', 'href="/projects"')
    content = content.replace('href="contact.html"', 'href="/contact"')
    
    # Update next/prev links in 404.html if they were hardcoded with .html
    content = content.replace('project-details.html?slug=', '/projects/')
    
    with open(file, 'w') as f:
        f.write(content)

with open('app.js', 'r') as f:
    content = f.read()

# Update JS logic for routes
content = content.replace("window.location.pathname.includes('project-details.html')", "window.location.pathname.startsWith('/projects/') && window.location.pathname !== '/projects' && window.location.pathname !== '/projects/'")
content = content.replace("window.location.pathname.includes('project-details')", "window.location.pathname.startsWith('/projects/') && window.location.pathname !== '/projects' && window.location.pathname !== '/projects/'")
content = content.replace("const urlParams = new URLSearchParams(window.location.search);\n        const slug = urlParams.get('slug');", "const slug = window.location.pathname.split('/').filter(Boolean).pop();")

# JS links
content = content.replace('href="project-details.html?slug=${project.slug}"', 'href="/projects/${project.slug}"')
content = content.replace('href="projects.html"', 'href="/projects"')
content = content.replace('project-details.html?slug=', '/projects/')

with open('app.js', 'w') as f:
    f.write(content)


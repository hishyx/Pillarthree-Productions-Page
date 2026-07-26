import re

with open('app.js', 'r') as f:
    content = f.read()

start_marker = "// Update hero"
end_marker = "heroContainer.removeEventListener('click', loadVideo);"

idx1 = content.find(start_marker)
idx2 = content.find(end_marker) + len(end_marker)

replacement = """// Immediately load YouTube Video in hero
                    const heroContainer = document.getElementById('hero-media-container');
                    const videoWrapper = document.getElementById('hero-video-wrapper');

                    if (heroContainer && project.youtubeId) {
                        videoWrapper.style.display = 'block';
                        videoWrapper.style.opacity = '1';

                        const createPlayer = () => {
                            videoWrapper.innerHTML = '<div id="yt-player-embed" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>';
                            new window.YT.Player('yt-player-embed', {
                                videoId: project.youtubeId,
                                playerVars: { 'autoplay': 1, 'mute': 1, 'rel': 0, 'playsinline': 1 },
                                events: {
                                    'onReady': (event) => {
                                        event.target.playVideo();
                                    },
                                    'onError': (event) => {
                                        console.error('YouTube Player Error:', event.data);
                                    }
                                }
                            });
                        };

                        if (window.YT && window.YT.Player) {
                            createPlayer();
                        } else {
                            const tag = document.createElement('script');
                            tag.src = "https://www.youtube.com/iframe_api";
                            const firstScriptTag = document.getElementsByTagName('script')[0];
                            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                            window.onYouTubeIframeAPIReady = createPlayer;
                        }
"""

new_content = content[:idx1] + replacement + content[idx2:]

with open('app.js', 'w') as f:
    f.write(new_content)

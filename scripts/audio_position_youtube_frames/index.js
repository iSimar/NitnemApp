const youtubeVideoToFrames = require('youtube-video-to-frames');

const youtubeUrl = 'https://www.youtube.com/watch?v=tLb0BzlGy2U';
const options = {
  videoName: 'video', fps: '1', select: 'gt(scene\\,0.1)', imgFileName: 'img', downloadLocation: 'tmp'
};

youtubeVideoToFrames(youtubeUrl, options, () => {
});

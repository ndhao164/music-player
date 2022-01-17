const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "ndhao"

const playlist = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd")
const btnPlay = $(".btn-toggle-play")
const player = $(".player")
const progress = $("#progress")
const btnNextSong = $(".btn-next")
const btnPrevSong = $(".btn-prev")
const btnRandom = $(".btn-random")
const btnRepeat = $(".btn-repeat")

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name: "Mang Tiền Về Cho Mẹ", singer: "Đen; Nguyên Thảo\n", path: "/music/1.mp3", image: "/img/1.jpg",
    }, {
        name: "Đế Vương", singer: "Đình Dũng; ACV", path: "/music/2.mp3", image: "/img/2.jpg",
    }, {
        name: "Gieo Quẻ", singer: "Hoàng Thuỳ Linh; Đen", path: "/music/3.mp3", image: "/img/3.jpg",
    }, {
        name: "Thương Em Đến Già", singer: "Lê Bảo Bình", path: "/music/4.mp3", image: "/img/4.jpg",
    }, {
        name: "Lưu Số Em Đi", singer: "Huỳnh Văn; Vũ Phụng Tiên", path: "/music/5.mp3", image: "/img/5.jpg",
    }, {
        name: "Tết Này Con Sẽ Về", singer: "Bùi Công Nam", path: "/music/6.mp3", image: "/img/6.jpg",
    }, {
        name: "No Love", singer: "Kellie", path: "/music/7.mp3", image: "/img/7.jpg",
    }, {
        name: "Hoa Tàn Tình Tan", singer: "Giang Jolee", path: "/music/8.mp3", image: "/img/8.jpg",
    }, {
        name: "Là Do Em Xui Thôi", singer: "Khói; Sofia; Châu Đăng Khoa", path: "/music/9.mp3", image: "/img/9.jpg",
    }, {
        name: "Đế Vương (Remix)", singer: "Dunghoangpham; HuyLee", path: "/music/10.mp3", image: "/img/10.jpg",
    },],
    setConfig: (key, value) => {
        console.log(key, value);
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmlSongs = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmlSongs.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý scroll
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth + '';
        }

        // Xử lý khi click play
        btnPlay.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // Xử lý progress khi audio play
        audio.ontimeupdate = () => {
            if (audio.duration) {
                progress.value = Math.floor(audio.currentTime / audio.duration * 100);
            }
        }

        // Xử lý tua audio khi thay đổi progress
        progress.onchange = () => {
            audio.currentTime = Math.floor(progress.value * audio.duration / 100);
        }

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, iterations: Infinity
        })
        // Mặc định sẽ pause
        cdThumbAnimate.pause();

        // Xử lý khi click button next
        btnNextSong.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý khi click button prev
        btnPrevSong.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
        }

        // Xử lý khi click button random
        btnRandom.onclick = () => {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            btnRandom.classList.toggle('active', _this.isRandom)
        }

        // Xử lý next song khi audio ended
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNextSong.click();
            }
        }

        // Xử lý lặp lại song
        btnRepeat.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            btnRepeat.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý click vào bài hát
        playlist.onclick = (e) => {
            const songNode = e.target.closest(".song:not(.active)")
            if (songNode || e.target.closest(".option")) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                if (e.target.closest(".option")) {

                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex === this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        if (this.currentIndex === 0) {
            this.currentIndex = this.songs.length - 1;
        } else {
            this.currentIndex--;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
        }, 100)
    },
    start: function () {
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe các sự kiện trong DOM
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();
    },

}
app.start();
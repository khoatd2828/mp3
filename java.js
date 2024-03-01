const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'DK_MUSIC'
const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentIndex: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    songs: [
        {
            name: 'Đánh Đổi',
            singer: 'Obito',
            path: './mp3/DanhDoi-Obito-11836728.mp3',
            image: './img/DD.jpg'
        },
    
        {
            name: 'Bật Tình Yêu Lên',
            singer: 'Hòa Minzy',
            path: './mp3/BatTinhYeuLen-TangDuyTanHoaMinzy-8715666.mp3',
            image: './img/BTYL.jpg'
        },
        
        {
            name: 'Đại Minh Tinh',
            singer: 'Văn Mai Hương',
            path: './mp3/DaiMinhTinh-VanMaiHuongHuaKimTuyen-11747544.mp3',
            image: './img/DMT.jpg'
        },
    
        {
            name: 'Exit Sign',
            singer: 'Obito',
            path: './mp3/ExitSign-HIEUTHUHAI-11966367.mp3',
            image: './img/ES.jpg'
        },
    
        {
            name: 'Như Anh Đã Thấy Em',
            singer: 'Obito',
            path: './mp3/NhuAnhDaThayEm-PhucXPFreakD-7370334.mp3',
            image: './img/NADTE.jpg'
        },
    
        {
            name: 'Rồi Ta Sẽ Ngắm Pháo Hoa Cùng Nhau',
            singer: 'Obito',
            path: './mp3/RoiTaSeNgamPhaoHoaCungNhau-OlewVietNam-8485329.mp3',
            image: './img/RTSNPHCN.jpg'
        },
    
        {
            name: 'Từng Quen',
            singer: 'Wren Evan',
            path: './mp3/TungQuen-WrenEvansitsnk-12038297.mp3',
            image: './img/TQ.jpg'
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        playlist.innerHTML = htmls.join('\n')
    },
    handleEvent: function() {
        const cdWidth = cd.offsetWidth

        //Xử lý quay đĩa CD
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000, //10 seconds
            iterations: Infinity
        })

        cdThumbAnimate.pause()
        //Xử lý phóng to thu nhỏ
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newcdWidth = cdWidth - scrollTop
            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0
            cd.style.opacity = newcdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if (app.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        } 

        //Khi Song được play
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi song bị pause
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua song 
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration /100
            audio.currentTime = seekTime
        }

        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.randomSong()
            } else {
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.randomSong()
            } else {
                app.prevSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        //Xử lý khi bấm nút Repeat Song
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat 
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat) //Boolean là true thì add class, false thì remove
        }

        //Xử lý bật tắt random Song
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom) //Boolean là true thì add class, false thì remove
        }

        //Xử lý Next Song khi audio ended
        audio.onended = function () {
            if (app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option') ) {
                // Xử lý khi click vào song
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    audio.play()
                    app.render()
                }
                // Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },

    randomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //định nghĩa các thuộc tính cho Object
        this.defineProperties()
        //Lắng nghe và xử lý các sự kiện
        this.handleEvent()
        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        //Render Playlist
        this.render()

        repeatBtn.classList.toggle('active', app.isRepeat)
        randomBtn.classList.toggle('active', app.isRandom)
    }
}
app.start()

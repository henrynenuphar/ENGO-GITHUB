export interface WordEntry {
    id: string
    word: string
    ipa: string
    audio: string
    meanings: {
        type: string
        definition: string
        example: string
    }[]
}

export const DICTIONARY_DATA: Record<string, WordEntry> = {
    // Lesson 1: Summer Activities
    'go camping': { id: 'go camping', word: 'go camping', ipa: '/ɡəʊ ˈkæmpɪŋ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/go-camping-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi cắm trại', example: 'I went camping in the forest last weekend.' }] },
    'go to the beach': { id: 'go to the beach', word: 'go to the beach', ipa: '/ɡəʊ tuː ðə biːtʃ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/go-to-the-beach-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi bãi biển', example: 'It was hot, so we went to the beach.' }] },
    'go to the farm': { id: 'go to the farm', word: 'go to the farm', ipa: '/ɡəʊ tuː ðə fɑːm/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/go-to-the-farm-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi thăm nông trại', example: 'I went to the farm and saw many cows.' }] },
    'learn how to cook': { id: 'learn how to cook', word: 'learn how to cook', ipa: '/lɜːn haʊ tuː kʊk/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/learn-how-to-cook-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'học nấu ăn', example: 'In the summer, I learned how to cook rice.' }] },
    'learn how to swim': { id: 'learn how to swim', word: 'learn how to swim', ipa: '/lɜːn haʊ tuː swɪm/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/learn-how-to-swim-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'học bơi', example: 'I learned how to swim in the pool.' }] },
    'visit my grandparents': { id: 'visit my grandparents', word: 'visit my grandparents', ipa: '/ˈvɪz.ɪt maɪ ˈɡræn.peə.rənts/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/visit-my-grandparents-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'thăm ông bà', example: 'I visited my grandparents in the countryside.' }] },
    'have a picnic': { id: 'have a picnic', word: 'have a picnic', ipa: '/hæv ə ˈpɪk.nɪk/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/have-a-picnic-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi dã ngoại', example: 'We had a picnic at the park on Sunday.' }] },
    'go fishing': { id: 'go fishing', word: 'go fishing', ipa: '/ɡəʊ ˈfɪʃ.ɪŋ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/go-fishing-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi câu cá', example: 'My dad and I went fishing near the lake.' }] },
    'ride a bike': { id: 'ride a bike', word: 'ride a bike', ipa: '/raɪd ə baɪk/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/ride-a-bike-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'đi xe đạp', example: 'I rode a bike around my school.' }] },
    'fly a kite': { id: 'fly a kite', word: 'fly a kite', ipa: '/flaɪ ə kaɪt/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fly-a-kite-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'thả diều', example: 'The wind was strong, so I flew a kite.' }] },

    // Animals
    apple: { id: 'apple', word: 'apple', ipa: '/ˈæp.əl/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/apple-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Quả táo', example: 'I like to eat red apples.' }] },
    cat: { id: 'cat', word: 'cat', ipa: '/kæt/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/cat-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con mèo', example: 'The cat says meow.' }] },
    dog: { id: 'dog', word: 'dog', ipa: '/dɒɡ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/dog-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con chó', example: 'My dog plays with a ball.' }] },
    bird: { id: 'bird', word: 'bird', ipa: '/bɜːd/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/bird-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con chim', example: 'A bird can fly high.' }] },
    fish: { id: 'fish', word: 'fish', ipa: '/fɪʃ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/fish-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con cá', example: 'Fish swim in the water.' }] },
    lion: { id: 'lion', word: 'lion', ipa: '/ˈlaɪ.ən/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/lion-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Sư tử', example: 'The lion is the king of the jungle.' }] },
    tiger: { id: 'tiger', word: 'tiger', ipa: '/ˈtaɪ.ɡər/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/tiger-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con hổ', example: 'Tigers have orange and black stripes.' }] },
    elephant: { id: 'elephant', word: 'elephant', ipa: '/ˈel.ɪ.fənt/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/elephant-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con voi', example: 'An elephant has a long nose.' }] },
    monkey: { id: 'monkey', word: 'monkey', ipa: '/ˈmʌŋ.ki/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/monkey-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Con khỉ', example: 'Monkeys love bananas.' }] },

    // School
    book: { id: 'book', word: 'book', ipa: '/bʊk/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/book-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Quyển sách', example: 'Open your book to page 10.' }] },
    pen: { id: 'pen', word: 'pen', ipa: '/pen/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/pen-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Cây bút bi', example: 'I write with a blue pen.' }] },
    pencil: { id: 'pencil', word: 'pencil', ipa: '/ˈpen.səl/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/pencil-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Bút chì', example: 'Sharpen your pencil, please.' }] },
    school: { id: 'school', word: 'school', ipa: '/skuːl/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/school-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Trường học', example: 'I go to school by bus.' }] },
    teacher: { id: 'teacher', word: 'teacher', ipa: '/ˈtiː.tʃər/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/teacher-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Giáo viên', example: 'My teacher is very kind.' }] },
    student: { id: 'student', word: 'student', ipa: '/ˈstjuː.dənt/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/student-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Học sinh', example: 'She is a good student.' }] },

    // Actions
    run: { id: 'run', word: 'run', ipa: '/rʌn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/run-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'Chạy', example: 'I run very fast.' }] },
    jump: { id: 'jump', word: 'jump', ipa: '/dʒʌmp/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/jump-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'Nhảy', example: 'Can you jump over the rock?' }] },
    swim: { id: 'swim', word: 'swim', ipa: '/swɪm/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/swim-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'Bơi', example: 'We swim in the pool.' }] },
    sing: { id: 'sing', word: 'sing', ipa: '/sɪŋ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/sing-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'Hát', example: 'Let\'s sing a song together.' }] },
    eat: { id: 'eat', word: 'eat', ipa: '/iːt/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/eat-uk.mp3', meanings: [{ type: 'verb (động từ)', definition: 'Ăn', example: 'I eat breakfast at 7 AM.' }] },

    // Colors
    red: { id: 'red', word: 'red', ipa: '/red/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/red-uk.mp3', meanings: [{ type: 'adj (tính từ)', definition: 'Màu đỏ', example: 'My shoes are red.' }] },
    blue: { id: 'blue', word: 'blue', ipa: '/bluː/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/blue-uk.mp3', meanings: [{ type: 'adj (tính từ)', definition: 'Màu xanh dương', example: 'The sky is blue.' }] },
    green: { id: 'green', word: 'green', ipa: '/ɡriːn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/green-uk.mp3', meanings: [{ type: 'adj (tính từ)', definition: 'Màu xanh lá', example: 'Grass is green.' }] },
    yellow: { id: 'yellow', word: 'yellow', ipa: '/ˈjel.əʊ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/yellow-uk.mp3', meanings: [{ type: 'adj (tính từ)', definition: 'Màu vàng', example: 'The sun is yellow.' }] },

    // Family
    family: { id: 'family', word: 'family', ipa: '/ˈfæm.əl.i/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/family-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Gia đình', example: 'I love my family.' }] },
    mother: { id: 'mother', word: 'mother', ipa: '/ˈmʌð.ər/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/mother-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Mẹ', example: 'My mother cooks yummy food.' }] },
    father: { id: 'father', word: 'father', ipa: '/ˈfɑː.ðər/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/father-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Bố', example: 'My father drives a car.' }] },
    baby: { id: 'baby', word: 'baby', ipa: '/ˈbeɪ.bi/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/baby-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Em bé', example: 'The baby is sleeping.' }] },

    // Nature
    sun: { id: 'sun', word: 'sun', ipa: '/sʌn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/sun-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Mặt trời', example: 'The sun is hot.' }] },
    moon: { id: 'moon', word: 'moon', ipa: '/muːn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/moon-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Mặt trăng', example: 'Look at the moon at night.' }] },
    star: { id: 'star', word: 'star', ipa: '/stɑːr/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/star-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Ngôi sao', example: 'Twinkle twinkle little star.' }] },
    rain: { id: 'rain', word: 'rain', ipa: '/reɪn/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/rain-uk.mp3', meanings: [{ type: 'noun (danh từ)', definition: 'Mưa', example: 'I like playing in the rain.' }] }
}

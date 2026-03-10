import eiffelImg from '@/assets/images/violympic/eiffel.png'
import kangarooImg from '@/assets/images/violympic/kangaroo.png'
import bigbenImg from '@/assets/images/violympic/bigben.png'
import pyramidsImg from '@/assets/images/violympic/pyramids.png'
import dayOfTheDeadImg from '@/assets/images/violympic/day_of_the_dead.png'
import onePillarImg from '@/assets/images/violympic/one_pillar.png'

export interface ViolympicQuestion {
    id: number
    text: string
    options: string[]
    correctAnswer: string
    imageUrl?: string
}

export const VIOLYMPIC_ROOMS = [
    { id: 'room_grade_3', name: 'Lớp 3' },
    { id: 'room_grade_4', name: 'Lớp 4' },
    { id: 'room_grade_5', name: 'Lớp 5', pin: '1403' },
]

export const VIOLYMPIC_QUESTIONS: Record<string, ViolympicQuestion[]> = {
    'room_grade_3': [
        { id: 1, text: 'A person who designs buildings and houses is an ________.', options: ['actor', 'architect', 'engineer', 'artist'], correctAnswer: 'architect' },
        { id: 2, text: 'Look! The little monkey ________ a yellow banana on the tree.', options: ['eats', 'ate', 'is eating', 'will eat'], correctAnswer: 'is eating' },
        { id: 3, text: 'We can\'t go to the park today. It is raining cats and ________ outside!', options: ['mice', 'birds', 'pigs', 'dogs'], correctAnswer: 'dogs' },
        { id: 4, text: 'Don\'t forget to ________ a lot of beautiful photos when you visit the museum.', options: ['do', 'make', 'take', 'catch'], correctAnswer: 'take' },
        { id: 5, text: 'Which word is the odd one out?', options: ['Apple', 'Banana', 'Carrot', 'Orange'], correctAnswer: 'Carrot' },
        { id: 6, text: 'In which country can you find this famous tower?', options: ['Italy', 'France', 'The UK', 'The USA'], correctAnswer: 'France', imageUrl: eiffelImg },
        { id: 7, text: 'My family ________ to the beautiful beach last summer.', options: ['go', 'goes', 'went', 'going'], correctAnswer: 'went' },
        { id: 8, text: 'Before my English speaking test, my teacher smiled and told me to "Break a ________!"', options: ['hand', 'finger', 'toe', 'leg'], correctAnswer: 'leg' },
        { id: 9, text: 'This cute animal is the symbol of which country?', options: ['Australia', 'Canada', 'Brazil', 'Japan'], correctAnswer: 'Australia', imageUrl: kangarooImg },
        { id: 10, text: 'Please ________ attention to the teacher during the English lesson.', options: ['give', 'pay', 'take', 'have'], correctAnswer: 'pay' },
    ],
    'room_grade_4': [
        { id: 1, text: 'In which school subject do you learn about numbers, shapes, and calculations?', options: ['Science', 'Math', 'Music', 'Art'], correctAnswer: 'Math' },
        { id: 2, text: 'Look! The boys ________ football in the schoolyard.', options: ['play', 'is playing', 'are playing', 'played'], correctAnswer: 'are playing' },
        { id: 3, text: 'My brother is so lazy. He just sits on the sofa and watches TV all day. He is a couch ________.', options: ['tomato', 'carrot', 'onion', 'potato'], correctAnswer: 'potato' },
        { id: 4, text: 'I always ________ my teeth twice a day.', options: ['wash', 'clean', 'brush', 'do'], correctAnswer: 'brush' },
        { id: 5, text: 'Which word is the odd one out?', options: ['Doctor', 'Teacher', 'Hospital', 'Farmer'], correctAnswer: 'Hospital' },
        { id: 6, text: 'This famous clock tower is located in which country?', options: ['The USA', 'The UK', 'France', 'Japan'], correctAnswer: 'The UK', imageUrl: bigbenImg },
        { id: 7, text: 'We ________ a great time at the beach last weekend.', options: ['have', 'has', 'had', 'having'], correctAnswer: 'had' },
        { id: 8, text: 'I love that new toy car, but it costs an arm and a ________!', options: ['hand', 'toe', 'foot', 'leg'], correctAnswer: 'leg' },
        { id: 9, text: 'In which country can you find these ancient monuments?', options: ['Egypt', 'China', 'India', 'Mexico'], correctAnswer: 'Egypt', imageUrl: pyramidsImg },
        { id: 10, text: 'Don\'t forget to ________ your hands before eating.', options: ['wash', 'make', 'take', 'brush'], correctAnswer: 'wash' },
    ],
    'room_grade_5': [
        { id: 1, text: 'A large area of land covered with many trees and plants is a ________.', options: ['desert', 'forest', 'beach', 'river'], correctAnswer: 'forest' },
        { id: 2, text: 'We have ________ finished our English homework.', options: ['do', 'did', 'just', 'yet'], correctAnswer: 'just' },
        { id: 3, text: 'She was so happy when she won the first prize. She was over the ________.', options: ['sun', 'star', 'sky', 'moon'], correctAnswer: 'moon' },
        { id: 4, text: 'He usually goes swimming, but today he ________ karate with his friends.', options: ['plays', 'makes', 'takes', 'does'], correctAnswer: 'does' },
        { id: 5, text: 'Which word is the odd one out?', options: ['Crocodile', 'Elephant', 'Lion', 'Table'], correctAnswer: 'Table' },
        { id: 6, text: 'This famous cultural event is called the "Day of the Dead". In which country is it traditionally celebrated?', options: ['The USA', 'Brazil', 'Mexico', 'Spain'], correctAnswer: 'Mexico', imageUrl: dayOfTheDeadImg },
        { id: 7, text: 'While my mother ________ dinner, the telephone rang.', options: ['cooks', 'cooked', 'is cooking', 'was cooking'], correctAnswer: 'was cooking' },
        { id: 8, text: 'Don\'t worry about the small mistakes. Just do your best and don\'t make a ________ out of a molehill.', options: ['mountain', 'hill', 'river', 'building'], correctAnswer: 'mountain' },
        { id: 9, text: 'This unique and famous pagoda is called the One Pillar Pagoda. It is located in which city of Vietnam?', options: ['Hue', 'Da Nang', 'Hanoi', 'Ho Chi Minh City'], correctAnswer: 'Hanoi', imageUrl: onePillarImg },
        { id: 10, text: 'It\'s going to rain. Remember to ________ an umbrella with you.', options: ['do', 'take', 'make', 'catch'], correctAnswer: 'take' },
    ]
}

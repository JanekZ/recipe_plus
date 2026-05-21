export interface RecipeStep {
    action: string
    description: string
    temperature: string
    speed: string
    time: string
}

export interface Recipe {
    id: number
    image: string
    name: string
    description: string
    tag: string
    cookingTime: number
    portions: number
    author: string
    isPublic: boolean
    ingredients: string[]
    steps: RecipeStep[]
}

export const recipes: Recipe[] = [
    {
        id: 1,
        image: 'https://placehold.co/400x300/F17939/white?text=Pizza+Margherita',
        name: 'Pizza Margherita',
        description: 'Klasyczna włoska pizza z sosem pomidorowym, mozzarellą i świeżą bazylią.',
        tag: 'pizza',
        cookingTime: 30,
        portions: 4,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '500g mąki pszennej',
            '300ml ciepłej wody',
            '7g suchych drożdży',
            '2 łyżki oliwy z oliwek',
            '200g sosu pomidorowego',
            '250g mozzarelli',
            'świeża bazylia',
            'sól do smaku'
        ],
        steps: [
            { action: 'Wyrabianie', description: 'Wymieszaj mąkę z drożdżami i solą, dodaj wodę i oliwę, wyrabiaj ciasto przez 10 minut.', temperature: '', speed: '3', time: '600' },
            { action: 'Wyrastanie', description: 'Odstaw ciasto do wyrośnięcia na 1 godzinę w ciepłe miejsce.', temperature: '', speed: '0', time: '' },
            { action: 'Pieczenie', description: 'Rozgrzej piekarnik do 220°C, włóż pizzę i piecz przez 15 minut.', temperature: '220', speed: '0', time: '900' },
            { action: 'Dekorowanie', description: 'Udekoruj świeżą bazylią przed podaniem.', temperature: '', speed: '0', time: '' }
        ]
    },
    {
        id: 2,
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Pancakes',
        name: 'Pancakes z Syropem Klonowym',
        description: 'Puszyste naleśniki podawane z masłem i naturalnym syropem klonowym.',
        tag: 'deser',
        cookingTime: 20,
        portions: 2,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '200g mąki pszennej',
            '2 jajka',
            '250ml mleka',
            '2 łyżki cukru',
            '1 łyżeczka proszku do pieczenia',
            'masło do smażenia',
            'syrop klonowy do podania'
        ],
        steps: [
            { action: 'Mieszanie', description: 'W misce wymieszaj mąkę, cukier i proszek do pieczenia.', temperature: '', speed: '2', time: '120' },
            { action: 'Łączenie', description: 'Dodaj jajka i mleko, mieszaj do uzyskania gładkiego ciasta.', temperature: '', speed: '3', time: '180' },
            { action: 'Smażenie', description: 'Smaż pancakes z obu stron na złoty kolor.', temperature: '180', speed: '0', time: '240' },
            { action: 'Podawanie', description: 'Podawaj polane syropem klonowym z kawałkiem masła.', temperature: '', speed: '0', time: '' }
        ]
    },
    {
        id: 3,
        image: 'https://placehold.co/400x300/F17939/white?text=Spaghetti',
        name: 'Spaghetti Carbonara',
        description: 'Kremowy makaron z jajkiem, parmezanem, guanciale i czarnym pieprzem.',
        tag: 'makaron',
        cookingTime: 25,
        portions: 3,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '400g spaghetti',
            '200g guanciale',
            '4 jajka',
            '100g parmezanu',
            'świeżo mielony czarny pieprz',
            'sól'
        ],
        steps: [
            { action: 'Gotowanie', description: 'Ugotuj makaron al dente w osolonej wodzie.', temperature: '100', speed: '0', time: '480' },
            { action: 'Podsmażanie', description: 'Pokrój guanciale w kostkę i podsmaż na patelni.', temperature: '180', speed: '0', time: '300' },
            { action: 'Mieszanie', description: 'W misce wymieszaj jajka z tartym parmezanem.', temperature: '', speed: '2', time: '60' },
            { action: 'Łączenie', description: 'Dodaj gorący makaron do guanciale, wlej masę jajeczną, mieszaj energicznie.', temperature: '', speed: '0', time: '120' },
            { action: 'Podawanie', description: 'Podawaj z świeżo mielonym pieprzem.', temperature: '', speed: '0', time: '' }
        ]
    },
    {
        id: 4,
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Sałatka',
        name: 'Sałatka Greecka',
        description: 'Świeże warzywa z fetą, oliwkami i sosem na bazie oliwy z oliwek.',
        tag: 'sałatka',
        cookingTime: 15,
        portions: 2,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '2 pomidory',
            '1 ogórek',
            '1 czerwona cebula',
            '200g sera feta',
            '100g oliwek kalamata',
            '3 łyżki oliwy z oliwek',
            'sok z cytryny',
            'oregano'
        ],
        steps: [
            { action: 'Krojenie', description: 'Pokrój pomidory, ogórka i cebulę w kostkę.', temperature: '', speed: '3', time: '180' },
            { action: 'Łączenie', description: 'Dodaj oliwki i pokruszoną fetę.', temperature: '', speed: '0', time: '' },
            { action: 'Doprawianie', description: 'Skrop oliwą i sokiem z cytryny, posyp oregano i delikatnie wymieszaj.', temperature: '', speed: '1', time: '60' }
        ]
    },
    {
        id: 5,
        image: 'https://placehold.co/400x300/F17939/white?text=Burgery',
        name: 'Burger Wołowy',
        description: 'Soczysty kotlet wołowy z serem cheddar, sałatą i pomidorem w bułce brioche.',
        tag: 'burger',
        cookingTime: 35,
        portions: 4,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '500g mięsa wołowego mielonego',
            '4 bułki brioche',
            '4 plastry sera cheddar',
            'sałata lodowa',
            '2 pomidory',
            '1 czerwona cebula',
            'sól i pieprz',
            'sos BBQ'
        ],
        steps: [
            { action: 'Formowanie', description: 'Uformuj kotlety z mięsa, dopraw solą i pieprzem.', temperature: '', speed: '0', time: '300' },
            { action: 'Grillowanie', description: 'Smaż kotlety po 4 minuty z każdej strony.', temperature: '200', speed: '0', time: '480' },
            { action: 'Topienie', description: 'Połóż plaster sera na każdym kotlecie.', temperature: '200', speed: '0', time: '60' },
            { action: 'Podpiekanie', description: 'Podpiecz bułki na grillu.', temperature: '180', speed: '0', time: '120' },
            { action: 'Składanie', description: 'Złóż burgery: bułka, sos, sałata, kotlet, pomidor, cebula.', temperature: '', speed: '0', time: '' },
            { action: 'Podawanie', description: 'Podawaj od razu.', temperature: '', speed: '0', time: '' }
        ]
    },
    {
        id: 6,
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Tiramisu',
        name: 'Tiramisu',
        description: 'Deser z warstw nasączonych kawą biszkoptów, kremu mascarpone i kakao.',
        tag: 'deser',
        cookingTime: 40,
        portions: 6,
        author: 'placeholder',
        isPublic: true,
        ingredients: [
            '500g mascarpone',
            '4 jajka',
            '100g cukru',
            '200g biszkoptów podłużnych',
            '300ml mocnej kawy',
            '2 łyżki kakao',
            'likier amaretto (opcjonalnie)'
        ],
        steps: [
            { action: 'Separacja', description: 'Oddziel żółtka od białek.', temperature: '', speed: '0', time: '120' },
            { action: 'Ubijanie', description: 'Żółtka utrzyj z cukrem na puszystą masę, dodaj mascarpone.', temperature: '', speed: '4', time: '300' },
            { action: 'Białka', description: 'Ubij białka na sztywną pianę i wmieszaj do masy.', temperature: '', speed: '5', time: '240' },
            { action: 'Układanie', description: 'Zanurzaj biszkopty w kawie i układaj w naczyniu na przemian z kremem.', temperature: '', speed: '0', time: '600' },
            { action: 'Chłodzenie', description: 'Schłódź w lodówce minimum 4 godziny.', temperature: '4', speed: '0', time: '14400' },
            { action: 'Dekorowanie', description: 'Przed podaniem posyp kakao.', temperature: '', speed: '0', time: '' }
        ]
    }
]
